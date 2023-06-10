import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { hexToBytes, toHex, utf8ToBytes } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak";

function Wallet({ address, setAddress, balance, setBalance, setPrivateKey, privateKey }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }
  async function onClick(){
    const privateKey = toHex(secp256k1.utils.randomPrivateKey())
    setPrivateKey(privateKey);
    console.log(privateKey);
    const publicKey = secp256k1.getPublicKey(hexToBytes(privateKey), false);
    console.log("Generated publicKEy:",publicKey)
    let firstByte = publicKey.slice(0,1);
    let rest = publicKey.slice(1,publicKey.length + 1);
    let hash = keccak256(rest);
    const address1 = hash.slice(-20);
    console.log("Address:", toHex(address1))
    await server.post(`address`,{
      address: "0x"+toHex(address1)
    })

  }
  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
      <div className="generator"> 
      <label>
        <h2>Generate your wallet</h2>

        <button onClick={onClick}>Generate Your privateKey</button>
      <div>{privateKey}</div>
        
      </label>
      </div>
    </div>
  );
  
}

export default Wallet;
