import { Point } from "../type/point"

export const calculateGradient = (p1 :Point, p2: Point, pVal: number) : number | null=>{
  var modInv = modInverse(p2.x - p1.x, pVal)
  // console.log("Mod Inverse: ", modInv)
  if (modInv){
    return positiveModulo((p2.y - p1.y) * positiveModulo(modInv, pVal), pVal)
  } else {
    console.log("Null Mod Result. P1: (", p1.x, ", ", p1.y,") | P2: (", p2.x,", ", p2.y,")")
    return null
  }
}

export const calculateGradientHomogenous = (p: Point, aVal : number, pVal: number) : number | null => {
  var modInv = modInverse(2 *p.y, pVal)
  // console.log("Mod Inverse: ", modInv)
  if (modInv) {
    return positiveModulo( positiveModulo(3*Math.pow(p.x, 2) + aVal, pVal) * positiveModulo(modInv, pVal), pVal)
  } else {
    console.log("Null Mod Result. P: (", p.x, ", ", p.y,")")
    return null
  }
}


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
    console.log("The number is not invertible.")
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

export const makeNumToHex = (num: number) : string => {
  return num.toString(16);
}

export const makeHexToNum = (hex: string) : number => {
  return parseInt(hex, 16);
}