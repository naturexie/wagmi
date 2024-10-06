'use client'
import { map, distinctUntilChanged } from "rxjs";
import { type ReactNode, useEffect, useState } from 'react'
import { setupWalletSelector } from '@near-wallet-selector/core'
import type { WalletSelector, Network } from "@near-wallet-selector/core";
import { setupEthereumWallets } from '@near-wallet-selector/ethereum-wallets'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupModal } from '@near-wallet-selector/modal-ui'
import type { Config } from "@wagmi/core";
import { reconnect, http, createConfig } from "@wagmi/core";
import { walletConnect, injected } from "@wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import  { useAccountStore } from "@/store/account";
import "@near-wallet-selector/modal-ui/styles.css";
declare global {
  interface Window {
    selector: WalletSelector & { getAccountId: () => string };
    selectorSubscription: any;
    modal: WalletSelectorModal;
    accountId: string;
    sender?: any;
    adaptiveRPC?: string;
    selectTokenUpdated?: boolean;
  }
}
const projectId = "87e549918631f833447b56c15354e450";
export default function NearWalletInit() {
  const accountStore = useAccountStore();
  async function init() {
    // evm wallet config start
    const nearBlock = {
      id: 397,
      name: "NEAR Mainnet",
      nativeCurrency: {
        decimals: 18,
        name: "NEAR",
        symbol: "NEAR",
      },
      rpcUrls: {
        default: { http: ["https://eth-rpc.mainnet.near.org"] },
        public: { http: ["https://eth-rpc.mainnet.near.org"] },
      },
      blockExplorers: {
        default: {
          name: "NEAR Explorer",
          url: "https://eth-explorer.near.org",
        },
      },
      testnet: false,
    };
    const wagmiConfig: Config = createConfig({
      chains: [nearBlock],
      transports: {
        [nearBlock.id]: http(),
      },
      connectors: [
        walletConnect({
          projectId,
          showQrModal: false,
        }),
        injected({ shimDisconnect: true }),
      ],
    });
    reconnect(wagmiConfig);
    const web3Modal = createWeb3Modal({
      wagmiConfig,
      projectId,
    });
  // evm wallet config end
    const selector: any = await setupWalletSelector({
      network: "mainnet",
      debug: false,
      modules: [
        setupMyNearWallet(),
        setupEthereumWallets({
          wagmiConfig,
          web3Modal,
          alwaysOnboardDuringSignIn: true,
        } as any),
      ],
    });
    const modal = setupModal(selector, {
      contractId: "boostfarm.ref-labs.near",
    })
    const { observable }: { observable: any } = selector.store;
    const subscription = observable
      .pipe(
        map((s: any) => s.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts: any) => {
        console.info("Accounts Update", nextAccounts);
        window.accountId = nextAccounts[0]?.accountId;
        accountStore.setAccountId(window.accountId || "");
      });
    window.selector = selector as WalletSelector & { getAccountId: () => string };
    window.modal = modal;
    window.selectorSubscription = subscription;
  }
  useEffect(() => {
    init();
  }, []);
  return null;
}

