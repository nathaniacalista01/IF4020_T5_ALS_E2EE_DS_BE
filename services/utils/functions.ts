import { Point } from "../type/point"

export const calculateGradient = (p1 :Point, p2: Point, pVal: number) : number =>{
  // return ((p2.y - p1.y)/ (p2.x - p1.x))
  return (p2.y - p1.y) * modInverse(p2.x - p1.x, pVal)!
}

export const calculateGradientHomogenous = (p: Point, aVal : number, pVal: number) : number => {
  // return (3*Math.pow(p.x, 2) + aVal) / (2 * p.y)
  return (3*Math.pow(p.x, 2) + aVal) * modInverse(2 *p.y, pVal)!
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
function gcd(a: number, b: number): number {
  while (b !== 0) {
      let temp = b;
      b = a % b;
      a = temp;
  }
  return a;
}

// Modular Inverse using Extended Euclidean Algorithm
function modInverse(a: number, m: number): number | null {
  a = positiveModulo(a, m);
  if (gcd(a, m) != 1){
    console.log("The number is not invertible. Number A:", a)
    return null
  }

  var i = 0;
  while (true) {
    if ((i * a)% m == 1){
      return i
    }
    i++
  }
}

export const isPointInList = (arr: Array<Point>, p : Point) => {
  arr.forEach(point => {
    if (point.isSamePoint(p)){
      return true
    } 
  })
  return false
}