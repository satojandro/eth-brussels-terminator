import { NearContext } from './context';

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar"
import { Wallet } from "./services/near-wallet";
import { EthereumView } from "./components/Ethereum/Ethereum";

// CONSTANTS
const MPC_CONTRACT = 'v2.multichain-mpc.testnet';

// NEAR WALLET
const wallet = new Wallet({ network: 'testnet', createAccessKeyFor: MPC_CONTRACT });

function App() {
  const [signedAccountId, setSignedAccountId] = useState('');
  const [status, setStatus] = useState("Please login to request a signature");
  const [chain, setChain] = useState('eth');

  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <Navbar />
      <div className="container">
        <h4> 🔗 NEAR Multi Chain DAO Voting</h4>
        {signedAccountId &&
          <div style={{ width: '50%', minWidth: '400px' }}>

            <div className="input-group input-group-sm mt-3 mb-3">
              <input className="form-control text-center" type="text" value={`MPC Contract: ${MPC_CONTRACT}`} disabled />
            </div>

            <div className="input-group input-group-sm my-2 mb-4">
              <span className="text-primary input-group-text" id="chain">Chain</span>
              <select className="form-select" aria-describedby="chain" value={chain} onChange={e => setChain(e.target.value)} >
                <option value="eth"> Ξ Ethereum </option>
                <option value="sol"> S Solana </option>
              </select>
            </div>

            {chain === 'eth' && <EthereumView props={{ setStatus, MPC_CONTRACT }} />}
            {chain === 'sol' && <h1>Coming Soon</h1>}
          </div>
        }

        <div className="mt-3 small text-center">
          {status}
        </div>
      </div>
    </NearContext.Provider>
  )
}

export default App
