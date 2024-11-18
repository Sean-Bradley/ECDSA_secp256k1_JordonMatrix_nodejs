import BN from 'big-integer'

type ECPoint = [BN.BigInteger, BN.BigInteger]
type Jordan = [[BN.BigInteger, BN.BigInteger], [BN.BigInteger, BN.BigInteger]]

function jordan_isinf(p: Jordan) {
  return p[0][0].eq(ZERO) && p[1][0].eq(ZERO)
}

function mulcoords(c1: ECPoint, c2: ECPoint): ECPoint {
  return [c1[0].multiply(c2[0]).mod(P), c1[1].multiply(c2[1]).mod(P)]
}

function mul_by_const(c: ECPoint, v: BN.BigInteger): ECPoint {
  return [c[0].multiply(v).mod(P), c[1]]
}

function addcoords(c1: ECPoint, c2: ECPoint): ECPoint {
  return [c1[0].multiply(c2[1]).add(c2[0].multiply(c1[1])).mod(P), c1[1].multiply(c2[1]).mod(P)]
}

function subcoords(c1: ECPoint, c2: ECPoint): ECPoint {
  var aa = c1[0].multiply(c2[1]).mod(P)
  var bb = c2[0].multiply(c1[1]).mod(P)
  var cc = aa.subtract(bb).add(P).mod(P)
  return [cc.mod(P), c1[1].multiply(c2[1]).mod(P)]
}

function invcoords(c: ECPoint): ECPoint {
  return [c[1], c[0]]
}

function jordan_add(a: Jordan, b: Jordan): Jordan {
  if (jordan_isinf(a)) return b
  if (jordan_isinf(b)) return a

  if (a[0][0].multiply(b[0][1]).subtract(b[0][0].multiply(a[0][1])).mod(P).eq(0)) {
    if (a[1][0].multiply(b[1][1]).subtract(b[1][0].multiply(a[1][1])).mod(P).eq(0)) {
      return jordan_double(a)
    } else {
      return [
        [ZERO, ONE],
        [ZERO, ONE]
      ]
    }
  }
  var xdiff = subcoords(b[0], a[0])
  var ydiff = subcoords(b[1], a[1])
  var m = mulcoords(ydiff, invcoords(xdiff))
  var x = subcoords(subcoords(mulcoords(m, m), a[0]), b[0])
  var y = subcoords(mulcoords(m, subcoords(a[0], x)), a[1])
  return [x, y]
}

function jordan_double(a: Jordan): Jordan {
  if (jordan_isinf(a)) {
    return [
      [ZERO, ONE],
      [ZERO, ONE]
    ]
  }
  var num = addcoords(mul_by_const(mulcoords(a[0], a[0]), THREE), [ZERO, ONE])
  var den = mul_by_const(a[1], TWO)
  var m = mulcoords(num, invcoords(den))
  var x = subcoords(mulcoords(m, m), mul_by_const(a[0], TWO))
  var y = subcoords(mulcoords(m, subcoords(a[0], x)), a[1])
  return [x, y]
}

function jordan_multiply(a: Jordan, n: BN.BigInteger): Jordan {
  if (jordan_isinf(a) || n.eq(ZERO)) {
    return [
      [ZERO, ZERO],
      [ZERO, ZERO]
    ]
  }
  if (n.eq(1)) {
    return a
  }
  if (n.lt(0) || n.geq(N)) {
    return jordan_multiply(a, n.mod(N))
  }
  if (n.mod(2).eq(ZERO)) {
    return jordan_double(jordan_multiply(a, n.divide(TWO)))
  }
  if (n.mod(2).eq(ONE)) {
    return jordan_add(jordan_double(jordan_multiply(a, n.divide(TWO))), a)
  }
  //default
  return [
    [ZERO, ZERO],
    [ZERO, ZERO]
  ]
}

function to_jordan(p: ECPoint): Jordan {
  return [
    [p[0], ONE],
    [p[1], ONE]
  ]
}

function from_jordan(p: Jordan): ECPoint {
  return [p[0][0].multiply(p[0][1].modInv(P)).mod(P), p[1][0].multiply(p[1][1].modInv(P)).mod(P)]
}

/**
 * Multiply an ECPoint.
 * @param {number} a - An ECPoint
 * @param {number} n - A Big Number
 */
function mul(a: ECPoint, n: BN.BigInteger): ECPoint {
  return from_jordan(jordan_multiply(to_jordan(a), n))
}

/**
 * Divide an ECPoint.
 * @param {number} a - An ECPoint
 * @param {number} n - A Big Number
 */
function div(a: ECPoint, n: BN.BigInteger): ECPoint {
  return from_jordan(jordan_multiply(to_jordan(a), n.modInv(N).mod(N)))
}

/**
 * Add two ECPoints.
 * @param {number} a - An ECPoint
 * @param {number} b - An ECPoint
 */
function add(a: ECPoint, b: ECPoint): ECPoint {
  return from_jordan(jordan_add(to_jordan(a), to_jordan(b)))
}

/**
 * Subtract two ECPoints.
 * @param {number} a - An ECPoint
 * @param {number} b - An ECPoint
 */
function sub(a: ECPoint, b: ECPoint): ECPoint {
  return from_jordan(jordan_add(to_jordan(a), to_jordan([b[0], P.subtract(b[1]).mod(P)])))
}

function negate(a: ECPoint): ECPoint {
  return [a[0], P.subtract(a[1]).mod(P)]
}

function ecPoint(a: BN.BigInteger): ECPoint {
  return mul([X, Y], a)
}

//Extract Bitcoin Public Key using R, S and Z values.

//secp256k1 constants
const P = BN('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16) //2²⁵⁶ - 2³² - 2⁹ - 2⁸ - 2⁷ - 2⁶ - 2⁴ - 1
const N = BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)
const ZERO = BN(0)
const SEVEN = BN(7)
const X = BN('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16)
const Y = BN('483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8', 16)

//other constants my functions use
const ONE = BN(1)
const TWO = BN(2)
const THREE = BN(3)
const Pp1d4 = BN('3fffffffffffffffffffffffffffffffffffffffffffffffffffffffbfffff0c', 16)
const HalfNp1 = BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a1', 16)

//https://2xoin.com/tx/9ec4bc49e828d924af1d1029cacf709431abbde46d59554b62bc270e3b29c4b1
const R = BN('d47ce4c025c35ec440bc81d99834a624875161a26bf56ef7fdc0f5d52f843ad1', 16)
const S = BN('44e1ff2dfd8102cf7a47c21d5c9fd5701610d04953c6836596b4fe9dd2f53e3e', 16)
const Z = BN('c0e2d0a89a348de88fda08211c70d1d7e52ccef2eb9459911bf977d587784c6e', 16)

//https://2xoin.com/tx/5cc5364a43ee9212387bfd45fa2e2c5e8ed7b2a32fa2f8e3084f6c8845ca3e15
//const R = BN('3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63', 16);
//const S = BN('5d38a230719d7282d6650c7a19ea810531501d391448aa61061828a073da404d', 16);
//const Z = BN('422e18e3c79ed7ba9eb41754d26ab846d6c0644abb51eeca74a8973d4d8e656b', 16);

//https://2xoin.com/tx/9312ccafb8aa624afe7fb7b4201a0ccc2a14ca2b8b8a3253093b975a6a85a280
//const R = BN('262e481b6d8905b5adba67aff05eb8261501b0a9434c0b7f043d00cf8d23c91b', 16);
//const S = BN('00bf82c0d212f30d3a0599e9b879516d762eaf5688ab83787cf470e99af5a69171', 16);
//const Z = BN('e2b8acb01c0ea6a2a1273fc9dbbe3cdd58c68afb54e240e1f51abcc652468204', 16);

//https://2xoin.com/tx/a963c57ba8a384bf708d5cf83c932e9174ebd0f82f3820e25dcc8a3d508aed54
//const R = BN('56cdf5abd9230a287712d7870f36e1e4005c41c99e008791364cce756b7b64b3', 16);
//const S = BN('00b443edc4471c5d1a037a1286019b886c0aa48675756db7f06adfb6f1c2a88f7e', 16);
//const Z = BN('4714f14e24a9beab8af71158e9e4a2609b45abe19152e2d674b7674913ab8692', 16);

//https://2xoin.com/tx/19d66411a5aa716a04b37197c11c93c9446a54694a2d2302093d8b0a93ed5d83
//const R = BN('00cabc3692f1f7ba75a8572dc5d270b35bcc00650534f6e5ecd6338e55355454d5', 16);
//const S = BN('0437b68b1ea23546f6f712fd6a7e5370cfc2e658a8f0245628afd8b6999d9da6', 16);
//const Z = BN('109a80161c75f67ff6b98166b061e82e4b739ee8cac2820f173ab8b1f9991242', 16);

//https://2xoin.com/tx/b4e7193c972ababd82b5feefe1af96b33bf062d2b959f44816a532e05940d032
//const R = BN('262e481b6d8905b5adba67aff05eb8261501b0a9434c0b7f043d00cf8d23c91b', 16);
//const S = BN('00d45c9ef85bb65a2a5bb3cf862124188adfe5fb8d430bc4b0d1222b1704d10d19', 16);
//const Z = BN('66042ab1a1befe137de5328ff1d4b263604824fe33c739d3a80565afdd94b34d', 16);

//https://2xoin.com/tx/bf474b96908ba7769120b2e8f2bfcbd2deca80c99b576b4b63bf18fb69e3d242
//const R = BN('35e4dd6e4d56638eee57fddf6af2d9f8a1cd8ae35d8e304b175f8c5ec0d80f6f', 16);
//const S = BN('24e0255335dc10284b3df9feadd1edc2bfb0540c03d1dbc09d65a84179f3b3a7', 16);
//const Z = BN('75c991a64fa69368d1988c2ad6f885b17b8a69868763852b2c86aacc6b4745e8', 16);

//https://2xoin.com/tx/85407f7fa84f5a4484677ca93c007ba4b65851727e9de8250dbf641e54e3c64f
//const R = BN('4132afc756fb11e23f782ecd5bf35808de865f292876ce97873748ccfac3fc86', 16);
//const S = BN('19f5ad1b23e3c98bafe6fe6f6cdfa38ec91e932aa56fc31183e89c1f1304ef8d', 16);
//const Z = BN('a13067843f92abe54f020e3bf51333fa45127c28bdce70c3c22714c7c22e5c13', 16);

//https://2xoin.com/tx/8e35c79125013bf900d976cf6247e311c9ca7766ec08309401f8da342c024122
//const R = BN('00ff1deb28d750b76b7dfde8c7ad94ce093f6b510c18ec7befa6070afe8be63852', 16);
//const S = BN('50cff9afaccf63b886e9fe31add54160f41854aa1776b4cbadbfa733084cfe85', 16);
//const Z = BN('72907d7e161ef2ca527ca381fa7e635e99faf2846582a28921428051d158365e', 16);

//https://2xoin.com/tx/fea40dbef8dc5479591f15e7022ee3047d768c97cd0e8fcbefc015eebcabffe1
//const R = BN('00c2cfb509ecda920fa8e509fb6772fc0e69d123c1efc789e65c8e0a7c98b39d20', 16);
//const S = BN('4ade22e432535ac5ac671658b9a64e0f81d11a32754be65001236674b0bf6794', 16);
//const Z = BN('437a504713ff63154b0ee63f07ff0cc988239cc73061c8a8f93078d23064441d', 16);

//https://2xoin.com/tx/97f136d0104b150abfe379e86c0441be4460262d69161483fdbc2cf70a2615ce
//const R = BN('21adb82a4cec5007cc494047c3f2c6a5dda8de342fe68020d256d5c185ccbb3a', 16);
//const S = BN('00fdfa125741412278a00a6bad077aed5b01db2a33dbe90323ab52eda8f9f83481', 16);
//const Z = BN('e34c2b45c02b4f89d03109da1cf4d2a3be0a8b8a5a413f3bcaf353aa55369d28', 16);

//https://2xoin.com/tx/535b898508430cf87947f69adec9dafee7250e720d2e839c7870f1d1fe1b2eda
//const R = BN('00f6968a978790ab2926eaca3dbd5b4b1c174ced093dbc0fdd4bf3b12028dc8dee', 16);
//const S = BN('45713db4c27106adb74cfdb47fcf5e2dc82faf62caf766766ad36cf8e948a7e3', 16);
//const Z = BN('1337c9f42cd25b003ba15d85b7ad26aa849e9e35327b74a1fda01ed43b893db6', 16);

//https://2xoin.com/tx/2588f2a1675c951a86c34691be0ed9cc0bb4c3e34a43828873333f0e5c515729
//const R = BN('44fd13a6632ffc105ff34eab7bb451c0b41c2e4893cbe34ca083ba063c70a523', 16);
//const S = BN('46908f86d324177264a86d2616c2dddfa4772819efe5766312bd67d8dcf54563', 16);
//const Z = BN('1ce2680a4ef7be67649206c8cb70f9e502053bb669d0c4fd4f7305917b83ac3f', 16);

//https://2xoin.com/tx/15a6c7e04626ab424175e74ea7bbc2e2f26faf5c7ec3da5b37b764265e1e32ce
//const R = BN('7d17d3683ec47bece3de5a691627ee9cf4b26fafcc7972edce6af1541a463b7f', 16);
//const S = BN('1fdf354d5334cf30fa20b5c7187f1ba74ed2da1cbb5914cc469d960723e99a6b', 16);
//const Z = BN('e50150f4644c9fd35937e839e0a77c2e69cbdb955c313a3ffa88be4342fa5621', 16);

const EC1 = mul([X, Y], ONE)
console.log('EC1 = ' + EC1[0].toString(16) + ', ' + EC1[1].toString(16))
const EC2 = mul([X, Y], TWO)
console.log('EC2 = ' + EC2[0].toString(16) + ', ' + EC2[1].toString(16))
const EC6 = mul(EC2, THREE)
console.log('EC6 = ' + EC6[0].toString(16) + ', ' + EC6[1].toString(16))
const ECHalfNp1 = mul([X, Y], HalfNp1)
console.log('ECHalfNp1 = ' + ECHalfNp1[0].toString(16) + ', ' + ECHalfNp1[1].toString(16))

console.log('\n*****************\n')

console.log('R                = ' + R.toString(16))
console.log('S                = ' + S.toString(16))
console.log('Z                = ' + Z.toString(16))

console.log()

// y² = x³ + 7

const x = R
console.log('x                = ' + x.toString(16))

const ySquared = x.pow(THREE).add(SEVEN).mod(P)
console.log('y²               = ' + ySquared.toString(16))
//there are two possible answers that produce a squared result, eg, 4 = 2² or -2². We only need one of them, doesn't matter which.

const y = ySquared.modPow(Pp1d4, P) //get the root of ySquared
//var y = P.minus(ySquared.modPow(Pp1d4, P)).mod(P);
console.log('y                = ' + y.toString(16))

console.log('-------------')
console.log()
console.log("2 ecPoints where x = R. I only need one of them, doesn't matter which")
console.log()
const ecPointK: ECPoint = [x, y]
console.log('ecPointK (1)     = ' + ecPointK[0].toString(16) + ', ' + ecPointK[1].toString(16))
console.log('ecPointK (2)     = ' + ecPointK[0].toString(16) + ', ' + P.minus(ecPointK[1]).mod(P).toString(16))

//pseudocode to get public key point
//pubKey  = (ecPoint(K) * (S/R)) - ecPoint(Z/R))

console.log()

console.log('-------------')
console.log()
console.log('calculate some more constants from the supplied R, S and Z values')
console.log()

const SdR = S.multiply(R.modInv(N)).mod(N)
console.log('S/R              = ' + SdR.toString(16))

const ZdR = Z.multiply(R.modInv(N)).mod(N)
console.log('Z/R              = ' + ZdR.toString(16))

const ecPointKmSdR: ECPoint = mul(ecPointK, SdR)
console.log('ecPointK * (S/R) = [' + ecPointKmSdR[0].toString(16) + ', ' + ecPointKmSdR[1].toString(16) + ']')

const ecPointZdR: ECPoint = mul([X, Y], ZdR)
console.log('ecPoint(Z/R)     = [' + ecPointZdR[0].toString(16) + ', ' + ecPointZdR[1].toString(16) + ']')

console.log()
console.log('-------------')
console.log()
console.log('2 Possible ecPoints for the public key. (depends on which ecPointK was used)')
console.log()
const ecPointPubKey1 = sub(ecPointKmSdR, ecPointZdR)
const ecPointPubKey2 = sub(negate(ecPointKmSdR), ecPointZdR) //when using P - root of ySquared value

console.log('pubKeyPoint (1)  = [' + ecPointPubKey1[0].toString(16) + ', ' + ecPointPubKey1[1].toString(16) + ']')
console.log('pubKeyPoint (2)  = [' + ecPointPubKey2[0].toString(16) + ', ' + ecPointPubKey2[1].toString(16) + ']')
console.log()

console.log('-------------')
console.log()
console.log('4 possible Bitcoin formatted public keys. (depends on which ecPointK was used)')
console.log()

console.log('uncompressed pubkey (1)        = \n04' + ecPointPubKey1[0].toString(16) + ecPointPubKey1[1].toString(16))
if (ecPointPubKey1[1].mod(TWO).eq(ZERO)) {
  console.log('compressed pubkey (1) (even y) = \n02' + ecPointPubKey1[0].toString(16))
} else {
  console.log('compressed pubkey (1) (odd y)  = \n03' + ecPointPubKey1[0].toString(16))
}
console.log()

console.log('uncompressed pubkey (2)        = \n04' + ecPointPubKey2[0].toString(16) + ecPointPubKey2[1].toString(16))
if (ecPointPubKey2[1].mod(TWO).eq(ZERO)) {
  console.log('compressed pubkey (2) (even y) = \n02' + ecPointPubKey2[0].toString(16))
} else {
  console.log('compressed pubkey (2) (odd y)  = \n03' + ecPointPubKey2[0].toString(16))
}
console.log()

// //simple test
// //1st i create an ecpoint of 10 (secp256k1)
// const myECPoint = mul([x, y], BN(10));
// console.log("myECPoint = [" + myECPoint[0].toString(16) + ", " + myECPoint[1].toString(16) + "]")
// //next i will divide it by 5. must convert 5 to a bignumber
// const ecResult = div(myECPoint, BN(5))
// console.log("ecResult = [" + ecResult[0].toString(16) + ", " + ecResult[1].toString(16) + "]")
// // //result should equal ecpoint of 2 (secp256k1)
// const ecTest = mul([x, y], BN(2)) //expected result
// console.log(ecResult[0].toString(16) === ecTest[0].toString(16) && ecResult[1].toString(16) === ecTest[1].toString(16))
