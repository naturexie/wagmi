'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAccountStore } from '@/store/account'
import WalletInit from './nearWallet'
function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  function showModal() {
    window.modal.show();
  }
  async function loginOut() {
    const curWallet = await window.selector.wallet();
    await curWallet?.signOut();
  }
  return (
    <>
      <div>
        <WalletInit />
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
      <div>NEAR area:</div>
      <div>
        {
          accountId ? <button onClick={loginOut}>{accountId}</button>: <button onClick={showModal}>login in</button>
        }
      </div>
    </>
  )
}

export default App
