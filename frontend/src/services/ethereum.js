import { Web3 } from "web3"
import { bytesToHex } from '@ethereumjs/util';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { deriveChildPublicKey, najPublicKeyStrToUncompressedHexPoint, uncompressedHexPointToEvmAddress } from './kdf';
import { Common } from '@ethereumjs/common'
import { BaseContract, Contract, JsonRpcProvider } from "ethers";

export class Ethereum {
  constructor(chain_rpc, chain_id) {
    this.web3 = new Web3(chain_rpc);
    this.provider = new JsonRpcProvider(chain_rpc);
    this.chain_id = chain_id;
    this.queryGasPrice();
    
  }

  async deriveAddress(accountId, derivation_path) {
    const publicKey = await deriveChildPublicKey(najPublicKeyStrToUncompressedHexPoint(), accountId, derivation_path);
    const address = await uncompressedHexPointToEvmAddress(publicKey);
    return { publicKey: Buffer.from(publicKey, 'hex'), address };
  }

  async queryGasPrice() {
    const maxFeePerGas = await this.web3.eth.getGasPrice();
    const maxPriorityFeePerGas = await this.web3.eth.getMaxPriorityFeePerGas();
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  async getBalance(accountId) {
    const balance = await this.web3.eth.getBalance(accountId)
    const ONE_ETH = 1000000000000000000n;
    return Number(balance * 100n / ONE_ETH) / 100;
  }

  async getContractViewFunction(receiver, abi, methodName, args = []) {
    const contract = new Contract(receiver, abi, this.provider);
    return await contract[methodName].call(...args);
    }

   createTransactionData(receiver, abi, methodName, args = []) {
    const contract = new Contract(receiver, abi);
    console.log("Create transaction data:", contract.interface.encodeFunctionData(methodName, args));
    return contract.interface.encodeFunctionData(methodName, args);
  }

  async createPayload(sender, receiver, amount, data) {
    const common = new Common({ chain: this.chain_id });

    // Get the nonce & gas price
    const nonce = await this.web3.eth.getTransactionCount(sender);
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.queryGasPrice();

    // Construct transaction
    const transactionData = {
      nonce,
      gasLimit: 1_000_000,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to: receiver,
      data: data,
      value: BigInt(this.web3.utils.toWei(amount, "ether")),
      chain: this.chain_id,
    };

    // Return the message hash
    const transaction = FeeMarketEIP1559Transaction.fromTxData(transactionData, { common });
    const payload = transaction.getHashedMessageToSign();
    console.log("Payload:", payload, "Transaction:", transaction);
    return { transaction, payload };
  }

  async requestSignatureToMPC(wallet, contractId, path, ethPayload, transaction, sender) {
    // Ask the MPC to sign the payload
    const payload = Array.from(ethPayload.reverse());
    const [big_r, big_s] = await wallet.callMethod({ contractId, method: 'sign', args: { payload, path, key_version: 0 }, gas: '250000000000000' });

    // reconstruct the signature
    const r = Buffer.from(big_r.substring(2), 'hex');
    const s = Buffer.from(big_s, 'hex');

    const candidates = [0n, 1n].map((v) => transaction.addSignature(v, r, s));
    const signature = candidates.find((c) => c.getSenderAddress().toString().toLowerCase() === sender.toLowerCase());

    if (!signature) {
      throw new Error("Signature is not valid");
    }

    if (signature.getValidationErrors().length > 0) throw new Error("Transaction validation errors");
    if (!signature.verifySignature()) throw new Error("Signature is not valid");

    return signature;
  }

  // This code can be used to actually relay the transaction to the Ethereum network
  async relayTransaction(signedTransaction) {
    try {
      const serializedTx = bytesToHex(signedTransaction.serialize());
      console.log("Serialized transaction:", serializedTx);
      const relayed = await this.web3.eth.sendSignedTransaction(serializedTx);
      console.log("Transaction relayed:", relayed);
      return relayed;
    } catch (error) {
      console.error("Error relaying transaction:", error);
      throw error;
    }
  }
}