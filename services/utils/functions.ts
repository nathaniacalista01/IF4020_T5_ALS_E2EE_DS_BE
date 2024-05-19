import { Point } from "../type/point"

export const calculateGradient = (p1 :Point, p2: Point, pVal: number) : number =>{
  // return ((p2.y - p1.y)/ (p2.x - p1.x))
  return (p2.y = p1.y) * modInverse(p2.x - p1.x, pVal)
}

export const calculateGradientHomogenous = (p: Point, aVal : number, pVal: number) : number => {
  // return (3*Math.pow(p.x, 2) + aVal) / (2 * p.y)
  return (3*Math.pow(p.x, 2) + aVal) * modInverse(2 *p.y, pVal)
}

export const operatorXOR = (block1: string, block2: string): string => {
  // Assume block1.length = block2.length
  var resBlock = "";
  for (var i = 0; i < block1.length; i++) {
    var charBinary1 = parseInt(block1[i]);
    var charBinary2 = parseInt(block2[i]);
    var resChar = (charBinary1 ^ charBinary2).toString();
    resBlock += resChar;
  }
  return resBlock;
};

export const isSquare = (n: number) => {
  return (Math.sqrt(n) % 1) === 0;
}

export const positiveModulo = (dividend: number, divisor: number) : number => {
  return ((dividend % divisor) + divisor) % divisor;
}

// Extended Euclidean Algorithm
function extendedGCD(a: number, b: number): { gcd: number, x: number, y: number } {
  if (a === 0) {
      return { gcd: b, x: 0, y: 1 };
  }

  const { gcd, x, y } = extendedGCD(b % a, a);
  return { gcd, x: y - Math.floor(b / a) * x, y: x };
}

// Modular Inverse using Extended Euclidean Algorithm
function modInverse(a: number, m: number): number {
  const { gcd, x } = extendedGCD(a, m);

  // If gcd is not 1, then the modular inverse does not exist
  if (gcd !== 1) {
      throw new Error(`Modular inverse does not exist for a = ${a} and m = ${m}`);
  }

  // x might be negative, so we take it modulo m to get the positive equivalent
  return (x % m + m) % m;
}