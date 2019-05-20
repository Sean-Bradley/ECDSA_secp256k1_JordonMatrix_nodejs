# ECDSA_secp256k1_JordonMatrix_nodejs 
contains javascript ecdsa generator, specifically secp256k1 properties, using jordon form matrices

Using the R,S and Z values, you can generate a public key.  
This example code demonstrates how to get public keys using RSZ values from a transaction input.  
The output from a typical RSZ will produce 2 possible public keys,  
If the public key matches the one used in the TX input, or generates the address used in the TX Input's previous output, then it can be considered a valid transaction that was signed using the private key of the found public key.

pseudocode to get public key point  
`pubKey  = (ecPoint(K) * (S/R)) - ecPoint(Z/R))`

## NodeJS
`$ npm install big-integer`
`$ nodejs getPubKeyFromRSZ.js`

## Python 3
`$ python getPubKeyFromRSZ.py`

## Video tutorial at
https://youtu.be/LQmnMmd3bDU

[![ECDSA Public Key from R, S and Z](https://img.youtube.com/vi/LQmnMmd3bDU/0.jpg)](https://youtu.be/LQmnMmd3bDU)
