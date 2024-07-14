import { useState, useEffect, useContext } from "react";
import { NearContext } from "../../context";

import { Ethereum } from "../../services/ethereum";
import { useDebounce } from "../../hooks/debounce";
import PropTypes from 'prop-types';
import { useRef } from "react";
import { TransferForm } from "./Transfer";
import { FunctionCallForm } from "./FunctionCall";

const Sepolia = 11155111;
const Eth = new Ethereum('https://sepolia.drpc.org', Sepolia, { mode: 'no-cors' });

export function EthereumView({ props: { setStatus, MPC_CONTRACT } }) {
  const { wallet, signedAccountId } = useContext(NearContext);

  //near contract call-function as-transaction mytestingaccount-923.testnet request json-args '{"request": {"text": "Generate a list of ideas to build on Ethereum hackathon"}}' prepaid-gas '300.0 Tgas' attached-deposit '0.1 NEAR' sign-as mytestingaccount-923.testnet network-config testnet sign-with-keychain send

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("request");
  const [signedTransaction, setSignedTransaction] = useState(null);
  const [senderAddress, setSenderAddress] = useState("")
  const [action, setAction] = useState("transfer")
  const [derivation, setDerivation] = useState("ethereum-1");
  const derivationPath = useDebounce(derivation, 1000);

  const childRef = useRef();

  useEffect(() => {
    setSenderAddress('Waiting for you to stop typing...')
  }, [derivation]);

  useEffect(() => {
    setEthAddress()

    async function setEthAddress() {
      setStatus('Querying your address and balance');
      setSenderAddress(`Deriving address from path ${derivationPath}...`);

      const { address } = await Eth.deriveAddress(signedAccountId, derivationPath);
      setSenderAddress(address);

      const balance = await Eth.getBalance(address);
      setStatus(`Your Ethereum address is: ${address}, balance: ${balance} ETH`);
    }
  }, [signedAccountId, derivationPath, setStatus]);

  async function chainSignature() {
    setStatus('🏗️ Creating transaction');

    const { transaction, payload } = await childRef.current.createPayload();
    // const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount, undefined);

    setStatus(`🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`);
    try {
      const signedTransaction = await Eth.requestSignatureToMPC(wallet, MPC_CONTRACT, derivationPath, payload, transaction, senderAddress);
      setSignedTransaction(signedTransaction);
      console.log('signedtx: ', signedTransaction);
      setStatus(`✅ Signed payload ready to be relayed to the Ethereum network`);
      setStep('relay');
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
      console.log(e);
      setLoading(false);
    }
  }



  async function relayTransaction() {
    setLoading(true);
    setStatus('🔗 Relaying transaction to the Ethereum network... this might take a while');
  
    try {
      const txHash = await Eth.relayTransaction(signedTransaction);
      console.log(txHash);
      setStatus(
        <>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank"> ✅ Successful </a>
        </>
      );
      childRef.current.afterRelay();
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
      console.log(e);
    }

    setStep('request');
    setLoading(false);
  }

  const UIChainSignature = async () => {
    setLoading(true);
    await chainSignature();
    setLoading(false);
  }

  return (
    <>
      <div className="row mb-3">
        {/*<label className="col-sm-2 col-form-label col-form-label-sm">Path:</label>
         <div className="col-sm-10">
          <input type="text" className="form-control form-control-sm" value={derivation} onChange={(e) => setDerivation(e.target.value)} disabled={loading} />
          <div className="form-text" id="eth-sender"> {senderAddress} </div>
        </div> */}
      </div>

      <FunctionCallForm ref={childRef} props={{ Eth, senderAddress, loading }} />


      <div className="text-center">
        {step === 'request' && <button className="btn btn-primary text-center" onClick={UIChainSignature} disabled={loading}> Sign Transaction </button>}
        {step === 'relay' && <button className="btn btn-success text-center" onClick={relayTransaction} disabled={loading}> Relay Transaction </button>}
      </div>
      <button onClick={()=>{
          wallet.callMethod({ contractId: 'mytestingaccount-923.testnet', method: 'request', args: { request: { text: "Generate a list of ideas to build on Ethereum hackathon" } }, deposit: '100000000000000000000000', gas: '300000000000000' })
          .then((res) => {
           console.log(res);
          })
          .catch((e) => {
           console.log(e);
          });
      }}>CLick</button>
      <p>Debug:           <div className="form-text" id="eth-sender">{derivation} - {senderAddress} </div>
      </p>
    </>
  )
}

EthereumView.propTypes = {
  props: PropTypes.shape({
    setStatus: PropTypes.func.isRequired,
    MPC_CONTRACT: PropTypes.string.isRequired,
  }).isRequired
};