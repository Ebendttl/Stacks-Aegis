import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

function setFeeds(pyth: number, redstone: number, onchain: number) {
  return simnet.callPublicFn(
    "risk-oracle",
    "set-feeds",
    [Cl.uint(pyth), Cl.uint(redstone), Cl.uint(onchain)],
    deployer
  );
}

describe("Risk Oracle", () => {
  beforeEach(() => {
    setFeeds(1_000_000, 1_000_000, 1_000_000);
  });

  describe("get-stability-score", () => {
    it("should return u100 when all three feeds are at perfect peg u1000000", () => {
      setFeeds(1_000_000, 1_000_000, 1_000_000);
      const { result } = simnet.callReadOnlyFn("risk-oracle", "get-stability-score", [], deployer);
      expect(result).toBeOk(Cl.uint(100));
    });

    it("should return u50 when feeds simulate a mild depeg averaging u975000", () => {
      // Score = (975000 - 950000) / 500 = 50
      setFeeds(975_000, 975_000, 975_000);
      const { result } = simnet.callReadOnlyFn("risk-oracle", "get-stability-score", [], deployer);
      expect(result).toBeOk(Cl.uint(50));
    });

    it("should return u0 (not a negative or error) when feeds drop below the u950000 floor", () => {
      setFeeds(930_000, 920_000, 940_000);
      const { result } = simnet.callReadOnlyFn("risk-oracle", "get-stability-score", [], deployer);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should return u0 when feeds are exactly at the floor u950000", () => {
      setFeeds(950_000, 950_000, 950_000);
      const { result } = simnet.callReadOnlyFn("risk-oracle", "get-stability-score", [], deployer);
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("get-raw-feeds", () => {
    it("should return the correct tuple with all three feed values", () => {
      setFeeds(1_000_000, 1_000_000, 1_000_000);
      const { result } = simnet.callReadOnlyFn("risk-oracle", "get-raw-feeds", [], deployer);
      expect(result).toBeOk(
        Cl.tuple({
          pyth: Cl.uint(1_000_000),
          redstone: Cl.uint(1_000_000),
          onchain: Cl.uint(1_000_000),
        })
      );
    });
  });

  describe("Protocol Safety Scores", () => {
    it("should allow the deployer to set a protocol score and return it correctly", () => {
      const { result: setResult } = simnet.callPublicFn(
        "risk-oracle",
        "set-protocol-score",
        [Cl.principal(wallet1), Cl.uint(85)],
        deployer
      );
      expect(setResult).toBeOk(Cl.bool(true));

      const { result: score } = simnet.callReadOnlyFn(
        "risk-oracle",
        "get-protocol-score",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(score).toBeUint(85);
    });

    it("should return the default u50 for an unregistered protocol principal", () => {
      const { result } = simnet.callReadOnlyFn(
        "risk-oracle",
        "get-protocol-score",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(result).toBeUint(50);
    });

    it("should return ERR-UNAUTHORIZED u101 when a non-owner calls set-protocol-score", () => {
      const { result } = simnet.callPublicFn(
        "risk-oracle",
        "set-protocol-score",
        [Cl.principal(wallet1), Cl.uint(100)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(101));
    });
  });
});
