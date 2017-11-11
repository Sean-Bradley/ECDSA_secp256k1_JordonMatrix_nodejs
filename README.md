# ECDSA_secp256k1_JordonMatrix_nodejs 
contains javascript ecdsa generator, specifically secp256k1 properties, using jordon form matrices

This example code demonstrates how to get public keys using RSZ values from a transaction input.
The output from a typical RSZ will produce 8 possible public keys,
test each public key outputted to see what address it creates, and if it creates the same address used in the transation inputs source output, than you can consider that the transaction input was signed correctly by the true holder of the senders private key, and not faked.


