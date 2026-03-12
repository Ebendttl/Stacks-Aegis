import { openContractCall } from '@stacks/connect';
import { uintCV, contractPrincipalCV, Pc } from '@stacks/transactions';
import { CONTRACT_ADDRESSES, SBTC_CONTRACT_ADDRESS, network } from './stacks-client';
import { useWalletStore } from '../modules/dashboard/WalletConnect';

// Mini visual toast helper since a fully loaded Shadcn toaster isn't initialized
export const toast = (message: string) => {
  const el = document.createElement("div");
  el.className = "fixed bottom-6 right-6 bg-black text-white px-6 py-4 border-2 border-stacks font-mono text-sm font-bold z-50 shadow-[4px_4px_0px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-bottom-5";
  el.innerText = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4500);
};

export const txDeposit = async (amount: number, onSuccess: () => void) => {
  const address = useWalletStore.getState().address;
  if (!address) return;

  const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split('.');
  const [sbtcAddress, sbtcName] = SBTC_CONTRACT_ADDRESS.split('.');

  await openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'deposit',
    functionArgs: [
      contractPrincipalCV(sbtcAddress, sbtcName),
      uintCV(amount)
    ],
    postConditions: [
      Pc.principal(address).willSendEq(amount).ft(SBTC_CONTRACT_ADDRESS, 'mock-sbtc')
    ],
    onFinish: (data) => {
      toast("Deposit submitted. Waiting for confirmation...");
      onSuccess();
    }
  });
};

export const txWithdraw = async (amount: number, onSuccess: () => void) => {
  const address = useWalletStore.getState().address;
  if (!address) return;

  const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split('.');
  const [sbtcAddress, sbtcName] = SBTC_CONTRACT_ADDRESS.split('.');

  await openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'withdraw',
    functionArgs: [
      contractPrincipalCV(sbtcAddress, sbtcName),
      uintCV(amount)
    ],
    postConditions: [
      Pc.principal(CONTRACT_ADDRESSES.aegisVault).willSendEq(amount).ft(SBTC_CONTRACT_ADDRESS, 'mock-sbtc')
    ],
    onFinish: (data) => {
      toast("Withdrawal confirmed. sBTC returned to your wallet.");
      onSuccess();
    }
  });
};

// Calls safe-withdraw on safe-vault
export const txSafeWithdraw = async (amount: number, onSuccess: () => void) => {
  const address = useWalletStore.getState().address;
  if (!address) return;

  const [contractAddress, contractName] = CONTRACT_ADDRESSES.safeVault.split('.');
  const [sbtcAddress, sbtcName] = SBTC_CONTRACT_ADDRESS.split('.');

  await openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'safe-withdraw',
    functionArgs: [
      contractPrincipalCV(sbtcAddress, sbtcName),
      uintCV(amount)
    ],
    postConditions: [
      Pc.principal(CONTRACT_ADDRESSES.safeVault).willSendEq(amount).ft(SBTC_CONTRACT_ADDRESS, 'mock-sbtc')
    ],
    onFinish: (data) => {
      toast("Safe vault withdrawal confirmed.");
      onSuccess();
    }
  });
};

// Calls re-enter-protection on safe-vault
export const txReEnterProtection = async (amount: number, isBreakerActive: boolean, onSuccess: () => void) => {
  if (isBreakerActive) {
    toast("Transaction blocked: Cannot re-enter pools while the circuit breaker is actively tripped.");
    return;
  }
  
  const address = useWalletStore.getState().address;
  if (!address) return;

  const [contractAddress, contractName] = CONTRACT_ADDRESSES.safeVault.split('.');
  const [sbtcAddress, sbtcName] = SBTC_CONTRACT_ADDRESS.split('.');
  const [aegisAddress, aegisName] = CONTRACT_ADDRESSES.aegisVault.split('.');

  await openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 're-enter-protection',
    functionArgs: [
      contractPrincipalCV(sbtcAddress, sbtcName),
      contractPrincipalCV(aegisAddress, aegisName)
    ],
    postConditions: [
      Pc.principal(CONTRACT_ADDRESSES.safeVault).willSendEq(amount).ft(SBTC_CONTRACT_ADDRESS, 'mock-sbtc')
    ],
    onFinish: (data) => {
      toast("Re-entered protection. Funds are back under Aegis guard.");
      onSuccess();
    }
  });
};
