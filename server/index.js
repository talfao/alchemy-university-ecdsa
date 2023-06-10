const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const app = express();
const cors = require("cors");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");
const port = 3042;

module.exports.secp256k1 = secp256k1;

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
  "0x7185a007bc3e2f1cb70985cb66c6d586ae3cba6d":200
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signatureR, signatureS, recovery, publicKey } = req.body;

  const message = {
    sender: sender,
    amount: parseInt(amount),
    recipient,
  };
  const signature = {
    r : BigInt(signatureR),
    s : BigInt(signatureS),
    recovery : recovery
  };
  console.log(message);
  console.log(signature);
  console.log(publicKey);
  if(verifySignature(signature, message,publicKey,sender)){
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
}
else{
  res.status(400).send({message: "You are not owner of account"});
}
});

app.post("/address", (req, res) => {
  const { address } = req.body;

  setInitialTestBalance(address);
  res.send("Ok");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
function setInitialTestBalance(address) {
  if (!balances[address]) {
    balances[address] = 150;
  }
}



// function recoverKey(message, signature, recoveryBit) {
//   return secp256k1.recoverPublicKey(hashMessage(message),signature,recoveryBit)
// }

// function getAddress(publicKey) {
//   let firstByte = publicKey.slice(0,1);
//   let rest = publicKey.slice(1,publicKey.length + 1);
//   let hash = keccak256(rest);
//   return hash.slice(-20);
// }

function hashMessage(message) {
  const hash = keccak256(utf8ToBytes(JSON.stringify(message)));
  //console.log(hash);
  return hash;
}

function verifySignature(signature, message,publicKey,sender){
  console.log(signature);
  console.log(message);
  console.log(publicKey);
  publicKey =  hexToBytes(publicKey)
  let firstByte = publicKey.slice(0,1);
  let rest = publicKey.slice(1,publicKey.length + 1);
  let hash = keccak256(rest);
  const address = hash.slice(-20);
  console.log(toHex(address));
  console.log(sender)
  let bool = secp256k1.verify(signature, hashMessage(message), publicKey);
  console.log("Bool value", bool)
  return bool && ("0x"+toHex(address) === sender);
}
