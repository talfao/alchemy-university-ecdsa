import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { hexToBytes, toHex, utf8ToBytes, } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function hashMessage(message) {
      const hash = keccak256(utf8ToBytes(JSON.stringify(message)));
      //console.log(hash);
      return hash;
  }
  function signMessage(msg,privateKey) {
      let hashOFMsg = hashMessage(msg);
      //console.log(hashMessage.value);
      let signature = secp256k1.sign(hashOFMsg,privateKey);
      return signature;
  }

  async function transfer(evt) {
    evt.preventDefault();

    const message = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient
    };

    console.log("Private key,", privateKey);
    console.log("Message", message);
    const signature = signMessage(message, privateKey);
    const publicKey = secp256k1.getPublicKey(privateKey,false);
    console.log("Public key", publicKey);
    console.log("Signature:",signature);
    //console.log("Transfer sign", toHex(signature.r));
    message.signatureR = signature.r.toString();
    // console.log("Try of array",  message.signatureR.toString());
    // console.log("Try of array",  BigInt(message.signatureR));
    message.signatureS = signature.s.toString();
    message.recovery = parseInt(1);
    message.publicKey = toHex(publicKey);
    try {
      const {
        data: { balance },
      } = await server.post(`send`, message );
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Sign your message
        <input
          placeholder="1a2a..."
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
