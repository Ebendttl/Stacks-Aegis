import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const DEPOSIT_AMOUNT = 1_000_000;
const ERR_VAULT_FROZEN = 200;
const ERR_UNAUTHORIZED = 300;
const ERR_INSUFFICIENT_BALANCE = 301;
const ERR_VAULT_LOCKED = 304;

// Full crisis cycle helper: deposit → trip → emergency-exit
function setupFundedSafeVault(user: string, amount: number) {
  simnet.callPublicFn("mock-sbtc", "mint", [Cl.uint(amount), Cl.principal(user)], deployer);
  simnet.callPublicFn("risk-oracle", "set-feeds", [Cl.uint(1_000_000), Cl.uint(1_000_000), Cl.uint(1_000_000)], deployer);
  simnet.callPublicFn("aegis-vault", "deposit", [Cl.uint(amount), Cl.contractPrincipal(deployer, "mock-sbtc")], user);
  simnet.callPublicFn("risk-oracle", "set-feeds", [Cl.uint(900_000), Cl.uint(900_000), Cl.uint(900_000)], deployer);
  simnet.callPublicFn("aegis-vault", "evaluate-and-trigger", [], deployer);
  simnet.callPublicFn(
    "aegis-vault",
    "emergency-exit",
    [
      Cl.principal(user),
      Cl.contractPrincipal(deployer, "mock-sbtc"),
      Cl.contractPrincipal(deployer, "safe-vault"),
    ],
    deployer
  );
}

describe("Safe Vault (The Anchor)", () => {

  // ─── Block A: Authorization ───────────────────────────────────────────
  describe("Block A — Authorization: The Most Important Tests", () => {
    // CRITICAL: This is the primary security guarantee of the entire protocol.
    it("should return ERR-UNAUTHORIZED u300 when any wallet calls receive-emergency-funds directly", () => {
      const { result } = simnet.callPublicFn(
        "safe-vault",
        "receive-emergency-funds",
        [Cl.principal(wallet1), Cl.uint(DEPOSIT_AMOUNT)],
        wallet1 // NOT aegis-vault - must be rejected
      );
      expect(result).toBeErr(Cl.uint(ERR_UNAUTHORIZED));
    });

    it("should return ERR-UNAUTHORIZED u300 when the deployer calls receive-emergency-funds directly", () => {
      const { result } = simnet.callPublicFn(
        "safe-vault",
        "receive-emergency-funds",
        [Cl.principal(wallet1), Cl.uint(DEPOSIT_AMOUNT)],
        deployer // deployer calling directly - must also be rejected
      );
      expect(result).toBeErr(Cl.uint(ERR_UNAUTHORIZED));
    });
  });

  // ─── Block B: Safe Withdraw ───────────────────────────────────────────
  describe("Block B — Safe Withdraw", () => {
    beforeEach(() => {
      setupFundedSafeVault(wallet1, DEPOSIT_AMOUNT);
    });

    it("should show the correct safe-vault balance for wallet-1 after an emergency exit flow", () => {
      const { result } = simnet.callReadOnlyFn(
        "safe-vault", "get-safe-balance", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeUint(DEPOSIT_AMOUNT);
    });

    it("should fully return funds and zero the balance after a complete safe-withdraw", () => {
      simnet.callPublicFn(
        "safe-vault", "safe-withdraw",
        [Cl.uint(DEPOSIT_AMOUNT), Cl.contractPrincipal(deployer, "mock-sbtc")],
        wallet1
      );
      const { result } = simnet.callReadOnlyFn(
        "safe-vault", "get-safe-balance", [Cl.principal(wallet1)], deployer
      );
      expect(result).toBeUint(0);
    });

    it("should return ERR-INSUFFICIENT-BALANCE u301 when withdrawing more than the safe balance", () => {
      const { result } = simnet.callPublicFn(
        "safe-vault", "safe-withdraw",
        [Cl.uint(DEPOSIT_AMOUNT * 99), Cl.contractPrincipal(deployer, "mock-sbtc")],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(ERR_INSUFFICIENT_BALANCE));
    });
  });

  // ─── Block C: Vault Lock — Governance Override ────────────────────────
  describe("Block C — Vault Lock: Governance Override", () => {
    beforeEach(() => {
      setupFundedSafeVault(wallet1, DEPOSIT_AMOUNT);
    });

    it("should allow the contract owner to lock the vault and reflect it in get-safe-vault-status", () => {
      simnet.callPublicFn("safe-vault", "toggle-vault-lock", [], deployer);
      const { result } = simnet.callReadOnlyFn("safe-vault", "get-safe-vault-status", [], deployer);
      const status = result as any;
      expect(status.data["vault-locked"].type).toBe(ClarityType.BoolTrue);

    });

    it("should return ERR-VAULT-LOCKED u304 when a user attempts safe-withdraw while the vault is locked", () => {
      simnet.callPublicFn("safe-vault", "toggle-vault-lock", [], deployer);
      const { result } = simnet.callPublicFn(
        "safe-vault", "safe-withdraw",
        [Cl.uint(DEPOSIT_AMOUNT), Cl.contractPrincipal(deployer, "mock-sbtc")],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(ERR_VAULT_LOCKED));
    });

    it("should return ERR-UNAUTHORIZED u300 when a non-owner calls toggle-vault-lock", () => {
      const { result } = simnet.callPublicFn("safe-vault", "toggle-vault-lock", [], wallet1);
      expect(result).toBeErr(Cl.uint(ERR_UNAUTHORIZED));
    });

    it("should re-lock correctly (idempotent toggle) when called twice by the owner", () => {
      simnet.callPublicFn("safe-vault", "toggle-vault-lock", [], deployer); // lock
      simnet.callPublicFn("safe-vault", "toggle-vault-lock", [], deployer); // unlock
      const { result } = simnet.callReadOnlyFn("safe-vault", "get-safe-vault-status", [], deployer);
      const status = result as any;
      expect(status.data["vault-locked"].type).toBe(ClarityType.BoolFalse);

    });
  });

  // ─── Block D: Re-Enter Protection Flow ───────────────────────────────
  describe("Block D — Re-Enter Protection Flow", () => {
    it("should complete the full crisis cycle: deposit -> trip -> exit -> reset -> re-enter", () => {
      setupFundedSafeVault(wallet1, DEPOSIT_AMOUNT);

      const { result: safeBalBefore } = simnet.callReadOnlyFn(
        "safe-vault", "get-safe-balance", [Cl.principal(wallet1)], deployer
      );
      expect(safeBalBefore).toBeUint(DEPOSIT_AMOUNT);

      // Oracle recovers and breaker resets
      simnet.callPublicFn("risk-oracle", "set-feeds", [Cl.uint(1_000_000), Cl.uint(1_000_000), Cl.uint(1_000_000)], deployer);
      simnet.callPublicFn("aegis-vault", "evaluate-and-trigger", [], deployer);

      // Re-enter protected vault
      const { result } = simnet.callPublicFn(
        "safe-vault",
        "re-enter-protection",
        [
          Cl.uint(DEPOSIT_AMOUNT),
          Cl.contractPrincipal(deployer, "mock-sbtc"),
          Cl.contractPrincipal(deployer, "aegis-vault"),
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      const { result: safeBalAfter } = simnet.callReadOnlyFn(
        "safe-vault", "get-safe-balance", [Cl.principal(wallet1)], deployer
      );
      expect(safeBalAfter).toBeUint(0);
    });

    it("should return ERR-VAULT-FROZEN u200 when re-enter-protection is called during an active crisis", () => {
      setupFundedSafeVault(wallet1, DEPOSIT_AMOUNT);
      // Breaker is still active - do NOT reset
      const { result } = simnet.callPublicFn(
        "safe-vault",
        "re-enter-protection",
        [
          Cl.uint(DEPOSIT_AMOUNT),
          Cl.contractPrincipal(deployer, "mock-sbtc"),
          Cl.contractPrincipal(deployer, "aegis-vault"),
        ],
        wallet1
      );
      // aegis-vault deposit correctly blocks the deposit and propagates ERR_VAULT_FROZEN
      expect(result).toBeErr(Cl.uint(ERR_VAULT_FROZEN));
    });
  });
});
