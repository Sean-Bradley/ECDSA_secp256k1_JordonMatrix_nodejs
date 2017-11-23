var BN = require("big-integer");

var jordan_isinf = function (p) {
    return p[0][0].eq(ZERO) && p[1][0].eq(ZERO);
}

var mulcoords = function (c1, c2) {
    return [c1[0].multiply(c2[0]).mod(P), c1[1].multiply(c2[1]).mod(P)];
}

var mul_by_const = function (c, v) {
    return [c[0].multiply(v).mod(P), c[1]];
}

var addcoords = function (c1, c2) {
    return [c1[0].multiply(c2[1]).add(c2[0].multiply(c1[1])).mod(P), c1[1].multiply(c2[1]).mod(P)];
}

var subcoords = function (c1, c2) {
    var aa = c1[0].multiply(c2[1]).mod(P);
    var bb = c2[0].multiply(c1[1]).mod(P);
    var cc = aa.subtract(bb).add(P).mod(P);
    return [cc.mod(P), c1[1].multiply(c2[1]).mod(P)];
}

var invcoords = function (c) {
    return [c[1], c[0]];
}

var jordan_add = function (a, b) {
    if (jordan_isinf(a)) return b;
    if (jordan_isinf(b)) return a;

    if (a[0][0].multiply(b[0][1]).subtract(b[0][0].multiply(a[0][1])).mod(P).eq(0)) {
        if (a[1][0].multiply(b[1][1]).subtract(b[1][0].multiply(a[1][1])).mod(P).eq(0)) {
            return jordan_double(a);
        } else {
            return [[ZERO, ONE], [ZERO, ONE]];
        }
    }
    var xdiff = subcoords(b[0], a[0]);
    var ydiff = subcoords(b[1], a[1]);
    var m = mulcoords(ydiff, invcoords(xdiff));
    var x = subcoords(subcoords(mulcoords(m, m), a[0]), b[0]);
    var y = subcoords(mulcoords(m, subcoords(a[0], x)), a[1]);
    return [x, y]
}

var jordan_double = function (a) {
    if (jordan_isinf(a)) {
        return [[ZERO, ONE], [ZERO, ONE]];
    }
    var num = addcoords(mul_by_const(mulcoords(a[0], a[0]), THREE), [ZERO, ONE]);
    var den = mul_by_const(a[1], TWO);
    var m = mulcoords(num, invcoords(den));
    var x = subcoords(mulcoords(m, m), mul_by_const(a[0], TWO));
    var y = subcoords(mulcoords(m, subcoords(a[0], x)), a[1]);
    return [x, y]
}

var jordan_multiply = function (a, n) {
    if (jordan_isinf(a) || n.eq(ZERO)) {
        return ([ZERO, ZERO], [ZERO, ZERO]);
    }
    if (n.eq(1)) {
        return a;
    }
    if (n.lt(0) || n.geq(N)) {
        return jordan_multiply(a, n.mod(N));
    }
    if (n.mod(2).eq(ZERO)) {
        return jordan_double(jordan_multiply(a, n.divide(TWO)));
    }
    if (n.mod(2).eq(ONE)) {
        return jordan_add(jordan_double(jordan_multiply(a, n.divide(TWO))), a);
    }
}

var to_jordan = function (p) {
    return [[p[0], ONE], [p[1], ONE]];
}

var from_jordan = function (p) {
    return [p[0][0].multiply(p[0][1].modInv(P)).mod(P), p[1][0].multiply(p[1][1].modInv(P)).mod(P)];
}

var mul = function (a, n) {
    return from_jordan(jordan_multiply(to_jordan(a), n))
}

var div = function (a, n) {
    return from_jordan(jordan_multiply(to_jordan(a), n.modInv(P).mod(P)))
}

var add = function (a, b) {
    return from_jordan(jordan_add(to_jordan(a), to_jordan(b)))
}

var sub = function (a, b) {
    return from_jordan(jordan_add(to_jordan(a), to_jordan([b[0], P.subtract(b[1]).mod(P)])))
}

var negate = function (a) {
    return [a[0], P.subtract(a[1]).mod(P)];
}

var ecPoint = function(a) {
    return mul([X,Y], a);
}



//Extract Bitcoin Public Key using R, S and Z values.

//secp256k1 constants
var P = new BN('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16);  //2²⁵⁶ - 2³² - 2⁹ - 2⁸ - 2⁷ - 2⁶ - 2⁴ - 1
var N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16);
var ZERO = new BN(0);
var SEVEN = new BN(7);
var X = new BN('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16);
var Y = new BN('483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', 16);

//other constants my functions use
var ONE = new BN(1);
var TWO = new BN(2);
var THREE = new BN(3);
var Pp1d4 = new BN('3fffffffffffffffffffffffffffffffffffffffffffffffffffffffbfffff0c', 16);


- // http://2coin.org/index.html?txid=e12fee70d2b0b308129b9b12d6f95be25617fc4f98c56900034ce466b3113074
- // var R = новый BN ('00aa7f028c41eaa2d1e6b13ab7d6de74a162a9e38e782783c69f2c94c3b5a73687', 16);
- // var S = новый BN ('0737baa0630cda8c21f025eee499934a4625eb9ab506ad7c38778aa2968cdfee', 16);
- // var Z = новый BN ('5534ef558bca21f84873907834d12e35b238850454ec6c3c62929c59b34853d4', 16);
    
    
console.log("R                = " + R.toString(16));
console.log("S                = " + S.toString(16));
console.log("Z                = " + Z.toString(16));

console.log();

// y² = x³ + 7

var x = R;
console.log("x                = " + x.toString(16));

var ySquared = x.pow(THREE).add(SEVEN).mod(P);
console.log("y²               = " + ySquared.toString(16));
//there are two possible answers that produce a squared result, eg, 4 = 2² or -2². We only need one of them, doesn't matter which.

var y = ySquared.modPow(Pp1d4, P); //get the root of ySquared
//var y = P.minus(ySquared.modPow(Pp1d4, P)).mod(P); 
console.log("y                = " + y.toString(16));

console.log("-------------");
console.log();
console.log("2 ecPoints where x = R. I only need one of them, doesn't matter which");
console.log();
var ecPointK = [x, y];
console.log("ecPointK (1)     = " + ecPointK[0].toString(16) + ", " + ecPointK[1].toString(16));
console.log("ecPointK (2)     = " + ecPointK[0].toString(16) + ", " + P.minus(ecPointK[1]).mod(P).toString(16));

//pseudocode to get public key point
//pubKey  = (ecPoint(K) * (S/R)) - ecPoint(Z/R))

console.log();


console.log("-------------");
console.log();
console.log("calculate some more constants from the supplied R, S and Z values");
console.log();

var SdR = S.multiply(R.modInv(N)).mod(N);
console.log("S/R              = " + SdR.toString(16));

var ZdR = Z.multiply(R.modInv(N)).mod(N);
console.log("Z/R              = " + ZdR.toString(16));

var ecPointKmSdR = mul(ecPointK, SdR);
console.log("ecPointK * (S/R) = [" + ecPointKmSdR[0].toString(16) + ", " + ecPointKmSdR[1].toString(16) + "]");

var ecPointZdR = mul([X, Y], ZdR);
console.log("ecPoint(Z/R)     = [" + ecPointZdR[0].toString(16) + ", " + ecPointZdR[1].toString(16) + "]");

console.log();
console.log("-------------");
console.log();
console.log("2 Possible ecPoints for the public key. (depends on which ecPointK was used)");
console.log();
var ecPointPubKey1 = sub(ecPointKmSdR, ecPointZdR); 
var ecPointPubKey2 = sub(negate(ecPointKmSdR), ecPointZdR); //when using P - root of ySquared value


console.log("pubKeyPoint (1)  = [" + ecPointPubKey1[0].toString(16) + ", " + ecPointPubKey1[1].toString(16) + "]");
console.log("pubKeyPoint (2)  = [" + ecPointPubKey2[0].toString(16) + ", " + ecPointPubKey2[1].toString(16) + "]");
console.log();

console.log("-------------");
console.log();
console.log("4 possible Bitcoin formatted public keys. (depends on which ecPointK was used)");
console.log();

console.log("uncompressed pubkey (1)        = \n04" + ecPointPubKey1[0].toString(16) + ecPointPubKey1[1].toString(16));
if(ecPointPubKey1[1].mod(TWO).eq(ZERO)){
    console.log("compressed pubkey (1) (even y) = \n02" + ecPointPubKey1[0].toString(16));
}else{
    console.log("compressed pubkey (1) (odd y)  = \n03" + ecPointPubKey1[0].toString(16));
}
console.log();

console.log("uncompressed pubkey (2)        = \n04" + ecPointPubKey2[0].toString(16) + ecPointPubKey2[1].toString(16));
if(ecPointPubKey2[1].mod(TWO).eq(ZERO)){
    console.log("compressed pubkey (2) (even y) = \n02" + ecPointPubKey2[0].toString(16));
}else{
    console.log("compressed pubkey (2) (odd y)  = \n03" + ecPointPubKey2[0].toString(16));
}
console.log();

