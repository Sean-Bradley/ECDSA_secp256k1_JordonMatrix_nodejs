def modInv(n, p):
    return pow(n, p - 2, p)


def jordan_isinf(p):
    return p[0][0] == 0 and p[1][0] == 0


def mulcoords(c1, c2):
    return (c1[0] * c2[0] % P, c1[1] * c2[1] % P)


def mul_by_const(c, v):
    return (c[0] * v % P, c[1])


def addcoords(c1, c2):
    return ((c1[0] * c2[1] + c2[0] * c1[1]) % P, c1[1] * c2[1] % P)


def subcoords(c1, c2):
    return ((c1[0] * c2[1] - c2[0] * c1[1]) % P, c1[1] * c2[1] % P)


def invcoords(c):
    return (c[1], c[0])


def jordan_add(a, b):
    if jordan_isinf(a):
        return b
    if jordan_isinf(b):
        return a
    if (a[0][0] * b[0][1] - b[0][0] * a[0][1]) % P == 0:
        if (a[1][0] * b[1][1] - b[1][0] * a[1][1]) % P == 0:
            return jordan_double(a)
        else:
            return ((0, 1), (0, 1))

    xdiff = subcoords(b[0], a[0])
    ydiff = subcoords(b[1], a[1])
    m = mulcoords(ydiff, invcoords(xdiff))
    x = subcoords(subcoords(mulcoords(m, m), a[0]), b[0])
    y = subcoords(mulcoords(m, subcoords(a[0], x)), a[1])
    return (x, y)


def jordan_double(a):
    if jordan_isinf(a):
        return ((0, 1), (0, 1))
    num = addcoords(mul_by_const(mulcoords(a[0], a[0]), 3), [0, 1])
    den = mul_by_const(a[1], 2)
    m = mulcoords(num, invcoords(den))
    x = subcoords(mulcoords(m, m), mul_by_const(a[0], 2))
    y = subcoords(mulcoords(m, subcoords(a[0], x)), a[1])
    return (x, y)


def jordan_multiply(a, n):
    if jordan_isinf(a) or n == 0:
        return ((0, 0), (0, 0))
    if n == 1:
        return a
    if n < 0 or n >= N:
        return jordan_multiply(a, n % N)
    if n % 2 == 0:
        return jordan_double(jordan_multiply(a, n // 2))
    else:  # n % 2 == 1:
        return jordan_add(jordan_double(jordan_multiply(a, n // 2)), a)


def to_jordan(p):
    return ((p[0], 1), (p[1], 1))


def from_jordan(p):
    return (p[0][0] * modInv(p[0][1], P) % P, p[1][0] * modInv(p[1][1], P) % P)


def mul(a, n):
    """
    Multiply an ECPoint.
    @param {number} a - An ECPoint
    @param {number} n - A Big Number
    """
    return from_jordan(jordan_multiply(to_jordan(a), n))


def div(a, n):
    """
    Divide an ECPoint.
    @param {number} a - An ECPoint
    @param {number} n - A Big Number
    """
    return from_jordan(jordan_multiply(to_jordan(a), modInv(n, N) % N))


def add(a, b):
    """
    Add two ECPoints.
    @param {number} a - An ECPoint
    @param {number} b - An ECPoint
    """
    return from_jordan(jordan_add(to_jordan(a), to_jordan(b)))


def sub(a, b):
    """
    Subtract two ECPoints.
    @param {number} a - An ECPoint
    @param {number} b - An ECPoint
    """
    return from_jordan(jordan_add(to_jordan(a), to_jordan((b[0], P - (b[1] % P)))))


def negate(a):
    return (a[0], P - (a[1] % P))


def ecPoint(a):
    return mul((X, Y), a)


# Extract Bitcoin Public Key using R, S and Z values.

# secp256k1 constants
# 2²⁵⁶ - 2³² - 2⁹ - 2⁸ - 2⁷ - 2⁶ - 2⁴ - 1
P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f
N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141
X = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798
Y = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8
Pp1d4 = 0x3fffffffffffffffffffffffffffffffffffffffffffffffffffffffbfffff0c


# https://2xoin.com/tx/9ec4bc49e828d924af1d1029cacf709431abbde46d59554b62bc270e3b29c4b1
R = 0xd47ce4c025c35ec440bc81d99834a624875161a26bf56ef7fdc0f5d52f843ad1
S = 0x44e1ff2dfd8102cf7a47c21d5c9fd5701610d04953c6836596b4fe9dd2f53e3e
Z = 0xc0e2d0a89a348de88fda08211c70d1d7e52ccef2eb9459911bf977d587784c6e


# https://2xoin.com/tx/5cc5364a43ee9212387bfd45fa2e2c5e8ed7b2a32fa2f8e3084f6c8845ca3e15
# R = 0x3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63
# S = 0x5d38a230719d7282d6650c7a19ea810531501d391448aa61061828a073da404d
# Z = 0x422e18e3c79ed7ba9eb41754d26ab846d6c0644abb51eeca74a8973d4d8e656b

# see js version for more example RSZ's to try.


print("R                = 0x%x" % R)
print("S                = 0x%x" % S)
print("Z                = 0x%x" % Z)


print()

# y² = x³ + 7

x = R
print("x                = 0x%x" % x)

ySquared = ((x ** 3) + 7) % P
print("y²               = 0x%x" % ySquared)
# there are two possible answers that produce a squared result, eg, 4 = 2² or -2². We only need one of them, doesn't matter which.

y = pow(ySquared, Pp1d4, P)  # get the root of ySquared
#y = (P - pow(ySquared, Pp1d4, P)) % P
print("y                = 0x%x" % y)

print("-------------")
print()
print("2 ecPoints where x = R. I only need one of them, doesn't matter which")
print()

ecPointK = (x, y)
print("ecPointK (1)     = 0x%x, 0x%x" % (ecPointK[0], ecPointK[1]))
print("ecPointK (2)     = 0x%x, 0x%x" % (ecPointK[0], (P - (ecPointK[1] % P))))

# pseudocode to get public key point
# pubKey = (ecPoint(K) * (S/R)) - ecPoint(Z/R))

print()


print("-------------")
print()
print("calculate some more constants from the supplied R, S and Z values")
print()

SdR = S * modInv(R, N) % N
print("S/R              = 0x%x" % SdR)

ZdR = Z * modInv(R, N) % N
print("Z/R              = 0x%x" % ZdR)


ecPointKmSdR = mul(ecPointK, SdR)
print("ecPointK * (S/R) = (0x%x, 0x%x)" % (ecPointKmSdR[0], ecPointKmSdR[1]))
ecPointZdR = mul([X, Y], ZdR)
print("ecPoint(Z/R)     = (0x%x, 0x%x)" % (ecPointZdR[0], ecPointZdR[1]))

print()
print("-------------")
print()
print("2 Possible ecPoints for the public key. (depends on which ecPointK was used)")
print()
ecPointPubKey1 = sub(ecPointKmSdR, ecPointZdR)
# when using P - root of ySquared value
ecPointPubKey2 = sub(negate(ecPointKmSdR), ecPointZdR)


print("pubKeyPoint (1)  = (0x%x, 0x%x)" %
      (ecPointPubKey1[0], ecPointPubKey1[1]))
print("pubKeyPoint (2)  = (0x%x, 0x%x)" %
      (ecPointPubKey2[0], ecPointPubKey2[1]))
print()

print("-------------")
print()
print("4 possible Bitcoin formatted public keys. (depends on which ecPointK was used)")
print()

print("uncompressed pubkey (1)        = \n04%x%x" %
      (ecPointPubKey1[0], ecPointPubKey1[1]))
if ecPointPubKey1[1] % 2 == 0:
    print("compressed pubkey (1) (even y) = \n02%x" % (ecPointPubKey1[0]))
else:
    print("compressed pubkey (1) (odd y)  = \n03%x" % (ecPointPubKey1[0]))

print()

print("uncompressed pubkey (2)        = \n04%x%x" %
      (ecPointPubKey2[0], ecPointPubKey2[1]))
if ecPointPubKey2[1] % 2 == 0:
    print("compressed pubkey (2) (even y) = \n02%x" % (ecPointPubKey2[0]))
else:
    print("compressed pubkey (2) (odd y)  = \n03%x" % (ecPointPubKey2[0]))

print()


# simple test
#  1st i create an ecpoint of 10 (secp256k1)
#myECPoint = mul((x, y), 10)
# console.log("myECPoint = [" + myECPoint[0].toString(16) + \
#             ", " + myECPoint[1].toString(16) + "]")
# // next i will divide it by 5. must convert 5 to a bignumber
#ecResult = div(myECPoint, 5)
# console.log("ecResult = [" + ecResult[0].toString(16) + \
#             ", " + ecResult[1].toString(16) + "]")
# // //result should equal ecpoint of 2 (secp256k1)
# ecTest = mul((x, y), 2)  # expected result
#print(ecResult[0] == ecTest[0] and ecResult[1] == ecTest[1])
