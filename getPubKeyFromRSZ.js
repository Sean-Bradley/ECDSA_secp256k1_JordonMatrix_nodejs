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


//http://2coin.org/index.html?txid=9ec4bc49e828d924af1d1029cacf709431abbde46d59554b62bc270e3b29c4b1
var R = new BN('d47ce4c025c35ec440bc81d99834a624875161a26bf56ef7fdc0f5d52f843ad1', 16);
var S = new BN('44e1ff2dfd8102cf7a47c21d5c9fd5701610d04953c6836596b4fe9dd2f53e3e', 16);
var Z = new BN('c0e2d0a89a348de88fda08211c70d1d7e52ccef2eb9459911bf977d587784c6e', 16);

//http://2coin.org/index.html?txid=5cc5364a43ee9212387bfd45fa2e2c5e8ed7b2a32fa2f8e3084f6c8845ca3e15
//var R = new BN('3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63', 16);
//var S = new BN('5d38a230719d7282d6650c7a19ea810531501d391448aa61061828a073da404d', 16);
//var Z = new BN('422e18e3c79ed7ba9eb41754d26ab846d6c0644abb51eeca74a8973d4d8e656b', 16);

//http://2coin.org/index.html?txid=9312ccafb8aa624afe7fb7b4201a0ccc2a14ca2b8b8a3253093b975a6a85a280
//var R = new BN('262e481b6d8905b5adba67aff05eb8261501b0a9434c0b7f043d00cf8d23c91b', 16);
//var S = new BN('00bf82c0d212f30d3a0599e9b879516d762eaf5688ab83787cf470e99af5a69171', 16);
//var Z = new BN('e2b8acb01c0ea6a2a1273fc9dbbe3cdd58c68afb54e240e1f51abcc652468204', 16);

//http://2coin.org/index.html?txid=a963c57ba8a384bf708d5cf83c932e9174ebd0f82f3820e25dcc8a3d508aed54
//var R = new BN('56cdf5abd9230a287712d7870f36e1e4005c41c99e008791364cce756b7b64b3', 16);
//var S = new BN('00b443edc4471c5d1a037a1286019b886c0aa48675756db7f06adfb6f1c2a88f7e', 16);
//var Z = new BN('4714f14e24a9beab8af71158e9e4a2609b45abe19152e2d674b7674913ab8692', 16);

//http://2coin.org/index.html?txid=19d66411a5aa716a04b37197c11c93c9446a54694a2d2302093d8b0a93ed5d83
//var R = new BN('00cabc3692f1f7ba75a8572dc5d270b35bcc00650534f6e5ecd6338e55355454d5', 16);
//var S = new BN('0437b68b1ea23546f6f712fd6a7e5370cfc2e658a8f0245628afd8b6999d9da6', 16);
//var Z = new BN('109a80161c75f67ff6b98166b061e82e4b739ee8cac2820f173ab8b1f9991242', 16);

//http://2coin.org/index.html?txid=b4e7193c972ababd82b5feefe1af96b33bf062d2b959f44816a532e05940d032
//var R = new BN('262e481b6d8905b5adba67aff05eb8261501b0a9434c0b7f043d00cf8d23c91b', 16);
//var S = new BN('00d45c9ef85bb65a2a5bb3cf862124188adfe5fb8d430bc4b0d1222b1704d10d19', 16);
//var Z = new BN('66042ab1a1befe137de5328ff1d4b263604824fe33c739d3a80565afdd94b34d', 16);

//http://2coin.org/index.html?txid=bf474b96908ba7769120b2e8f2bfcbd2deca80c99b576b4b63bf18fb69e3d242
//var R = new BN('35e4dd6e4d56638eee57fddf6af2d9f8a1cd8ae35d8e304b175f8c5ec0d80f6f', 16);
//var S = new BN('24e0255335dc10284b3df9feadd1edc2bfb0540c03d1dbc09d65a84179f3b3a7', 16);
//var Z = new BN('75c991a64fa69368d1988c2ad6f885b17b8a69868763852b2c86aacc6b4745e8', 16);

//http://2coin.org/index.html?txid=85407f7fa84f5a4484677ca93c007ba4b65851727e9de8250dbf641e54e3c64f
//var R = new BN('4132afc756fb11e23f782ecd5bf35808de865f292876ce97873748ccfac3fc86', 16);
//var S = new BN('19f5ad1b23e3c98bafe6fe6f6cdfa38ec91e932aa56fc31183e89c1f1304ef8d', 16);
//var Z = new BN('a13067843f92abe54f020e3bf51333fa45127c28bdce70c3c22714c7c22e5c13', 16);

//http://2coin.org/index.html?txid=8e35c79125013bf900d976cf6247e311c9ca7766ec08309401f8da342c024122
//var R = new BN('00ff1deb28d750b76b7dfde8c7ad94ce093f6b510c18ec7befa6070afe8be63852', 16);
//var S = new BN('50cff9afaccf63b886e9fe31add54160f41854aa1776b4cbadbfa733084cfe85', 16);
//var Z = new BN('72907d7e161ef2ca527ca381fa7e635e99faf2846582a28921428051d158365e', 16);

//http://2coin.org/index.html?txid=fea40dbef8dc5479591f15e7022ee3047d768c97cd0e8fcbefc015eebcabffe1
//var R = new BN('00c2cfb509ecda920fa8e509fb6772fc0e69d123c1efc789e65c8e0a7c98b39d20', 16);
//var S = new BN('4ade22e432535ac5ac671658b9a64e0f81d11a32754be65001236674b0bf6794', 16);
//var Z = new BN('437a504713ff63154b0ee63f07ff0cc988239cc73061c8a8f93078d23064441d', 16);

//http://2coin.org/index.html?txid=97f136d0104b150abfe379e86c0441be4460262d69161483fdbc2cf70a2615ce
//var R = new BN('21adb82a4cec5007cc494047c3f2c6a5dda8de342fe68020d256d5c185ccbb3a', 16);
//var S = new BN('00fdfa125741412278a00a6bad077aed5b01db2a33dbe90323ab52eda8f9f83481', 16);
//var Z = new BN('e34c2b45c02b4f89d03109da1cf4d2a3be0a8b8a5a413f3bcaf353aa55369d28', 16);

//http://2coin.org/index.html?txid=535b898508430cf87947f69adec9dafee7250e720d2e839c7870f1d1fe1b2eda
//var R = new BN('00f6968a978790ab2926eaca3dbd5b4b1c174ced093dbc0fdd4bf3b12028dc8dee', 16);
//var S = new BN('45713db4c27106adb74cfdb47fcf5e2dc82faf62caf766766ad36cf8e948a7e3', 16);
//var Z = new BN('1337c9f42cd25b003ba15d85b7ad26aa849e9e35327b74a1fda01ed43b893db6', 16);

//http://2coin.org/index.html?txid=2588f2a1675c951a86c34691be0ed9cc0bb4c3e34a43828873333f0e5c515729
//var R = new BN('44fd13a6632ffc105ff34eab7bb451c0b41c2e4893cbe34ca083ba063c70a523', 16);
//var S = new BN('46908f86d324177264a86d2616c2dddfa4772819efe5766312bd67d8dcf54563', 16);
//var Z = new BN('1ce2680a4ef7be67649206c8cb70f9e502053bb669d0c4fd4f7305917b83ac3f', 16);

//http://2coin.org/index.html?txid=15a6c7e04626ab424175e74ea7bbc2e2f26faf5c7ec3da5b37b764265e1e32ce
//var R = new BN('7d17d3683ec47bece3de5a691627ee9cf4b26fafcc7972edce6af1541a463b7f', 16);
//var S = new BN('1fdf354d5334cf30fa20b5c7187f1ba74ed2da1cbb5914cc469d960723e99a6b', 16);
//var Z = new BN('e50150f4644c9fd35937e839e0a77c2e69cbdb955c313a3ffa88be4342fa5621', 16);

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

