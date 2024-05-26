import { eccBase } from "../type/eccBase";
import { Point } from "../type/point";
import { calculateGradient, calculateGradientHomogenous, isSquare, makeHexToNum, makeNumToHex, positiveModulo } from "../utils/functions";
import { generatePrimeNumber, generateSmallerPrimeNumber, getRandomNumber } from "../utils/number"

const INFINITY_POINT = new Point(Infinity, Infinity)

type IncrementingPoint = {
  exponent: number,
  point: Point
}

type PairPoint = {
  p1: Point,
  p2: Point
}

export type PairPointValue = {
  p1Val : string,
  p2Val : string
}

export class ECEG {
  public aVal : number
  public bVal : number
  public pVal : number
  public points : Array<Point>
  public basePoint : Point

  // The equation will always be y^2 = (x^3 + ax + b) mod p
  constructor() {
    this.aVal = generateSmallerPrimeNumber();
    this.bVal = generateSmallerPrimeNumber();
    this.pVal = generateSmallerPrimeNumber();
    this.points = []
    this.basePoint = new Point(0,0)
    this.calculatePoints();
  }

  public calculatePoints = () => {
    this.points = []

    // Check the requirements
    let check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    while (check == 0){
      this.aVal = generateSmallerPrimeNumber();
      this.bVal = generateSmallerPrimeNumber();
      check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    }

    for( let i = 0; i < this.pVal-1; i++){
      const res = this.calculateY(i);
      const selection1 = res % 1 == 0 // the value should be an integer
      const selection2 = (res > 0 && res < this.pVal) // [1...pVal-1]
      if (selection1 && selection2){
        this.points.push(new Point(i, res))
        this.points.push(new Point(i, this.pVal - res))
      }
    }
  }


  public setValue = (a: number, b: number, p : number) => {
    this.aVal = a;
    this.bVal = b;
    this.pVal = p;
    this.calculatePoints()
  }

  public getValue = () => {
    const data : eccBase = {a: this.aVal, b: this.bVal, p: this.pVal, pointVal: this.basePoint.getPointValue()}
    return data
  }

  public setBasePoint = (p: Point) => {
    this.basePoint = p;
  }

  public calculateY = (x: number) : number => {
    return Math.sqrt( (Math.pow(x, 3) + this.aVal*x + this.bVal) % this.pVal);
  }

  public calculateCoorX = (p1: Point, p2: Point, m: number) => {
    const res = positiveModulo((positiveModulo(Math.pow(m, 2), this.pVal) - positiveModulo(p1.x, this.pVal) - positiveModulo(p2.x, this.pVal)), this.pVal)
    return res
  }

  public calculateCoorY = (p1: Point, p2: Point, m: number) => {
    const xR = this.calculateCoorX(p1, p2, m)
    const res = positiveModulo(( positiveModulo(m, this.pVal) * positiveModulo(p1.x - xR, this.pVal) - positiveModulo(p1.y, this.pVal)), this.pVal)
    return res
  }

  public addPoint = (p1: Point, p2: Point) => {

    // Handle cases
    if (p1.isInverse(p2, this.pVal)){
      return INFINITY_POINT
    }
    if (p1.isSamePoint(INFINITY_POINT)){
      return p2
    } else if (p2.isSamePoint(INFINITY_POINT)){
      return p1
    }
    if (p1.isSamePoint(p2) && p1.y == 0){
      return INFINITY_POINT
    }

    const m = p1.isSamePoint(p2) ? calculateGradientHomogenous(p1, this.aVal, this.pVal) : calculateGradient(p1, p2, this.pVal)
    const x = this.calculateCoorX(p1, p2, m!)
    const y = this.calculateCoorY(p1, p2, m!)


    return new Point(x, y)
  }

  public multiplyPoint = (p : Point, n : number | string) : Point => {

    // n can be number or hexadecimal
    if (typeof n === 'string') {
      n = makeHexToNum(n);
    }

    // Construct dictionary
    const multiplicationDict = Array<IncrementingPoint>()
    let exp = 1;
    let idx = 0;
    let tempPoint = new Point(0,0)
    tempPoint.copyPoint(p);
    while (exp <= n){
      const currentIncrementPoint : IncrementingPoint = {
        exponent: exp, 
        point: tempPoint
      }
      multiplicationDict.push(currentIncrementPoint)
      exp *= 2
      idx += 1

      const newTempPoint = this.addPoint(tempPoint, tempPoint)
      tempPoint = newTempPoint;
    }

    // Decremental addition
    // Set idx to the last idx of the list
    idx = multiplicationDict.length - 1
    let decrementalN = n
    let resPoint = INFINITY_POINT
    while (decrementalN > 0){
      // Decremental
      while(multiplicationDict[idx].exponent > decrementalN){
        idx -=1;
      }

      const tempIncrementPoint = multiplicationDict[idx]
      resPoint = this.addPoint(resPoint, tempIncrementPoint.point)
      decrementalN -= tempIncrementPoint.exponent
    }
    return resPoint    
  }

  public getRandomPoint = () => {
    this.basePoint = this.points[Math.floor(Math.random() * this.points.length)]
    const temp = new Point(this.basePoint.x, this.basePoint.y)
    return temp
  }

  public searchPoint = (p : Point) : Point | null => {
    this.points.forEach(point => {
      if (point.isSamePoint(p)){
        return point
      }
    })
    return null
  }

  public minusPoint = (p1: Point, p2: Point) => {
    const newP2 = new Point(0,0)
    newP2.copyPoint(p2)
    newP2.changeToInverse()
    return this.addPoint(p1, newP2)
  }

  public encryptECEG = (k: number, basePoint: Point, secretPoint: Point, publicKey: Point) : PairPoint => {
    const kPb = this.multiplyPoint(publicKey, k)
    const resPairPoint : PairPoint = {
      p1: this.multiplyPoint(basePoint, k),
      p2: this.addPoint(secretPoint, kPb)
    }
    return resPairPoint
  }

  public decryptECEG = (privateKey: number | string, pairPoint: PairPoint) : Point => {
    const p1 = pairPoint.p1
    const p2 = pairPoint.p2
    const bkB = this.multiplyPoint(p1, privateKey)
    return this.minusPoint(p2, bkB)
  }

  public getValueFromPairPoint = (pairPoint : PairPoint) => {
    const pairPointVal : PairPointValue = {
      p1Val : pairPoint.p1.getPointValue(),
      p2Val : pairPoint.p2.getPointValue()
    }
    return pairPointVal
  }

  public getPointFromPairPointValue = (pairPointVal : PairPointValue)  => {
    const p1 = new Point(0,0)
    p1.setPointValue(pairPointVal.p1Val)
    const p2 = new Point(0,0)
    p2.setPointValue(pairPointVal.p2Val)
    
    const pairPoint : PairPoint = {
      p1 : p1,
      p2 : p2
    }
    return pairPoint
  }

  public makePairPointValueToString = (pairPointVal : PairPointValue) => {
    return pairPointVal.p1Val + pairPointVal.p2Val
  }

  public makeStringToPairPointValue = (val : string) => {
    const p1Val = val.slice(0, 16)
    const p2Val = val.slice(16,32)
    const pairPointVal : PairPointValue = {
      p1Val: p1Val,
      p2Val: p2Val
    }
    return pairPointVal
  }

  public getKValue = () => {
    let k = generateSmallerPrimeNumber();
    while ( k < 1 || k > this.pVal-1) {
      k = generateSmallerPrimeNumber();
    }
    return k
  }
}



// var incorrectCount = 0
// for (var i = 0; i < 50; i++){
//   const temp = new ECEG()
//   console.log("a: "+temp.aVal+" b: "+temp.bVal +" p: "+temp.pVal)
  
//   const basePoint = temp.getRandomPoint()
//   console.log("TEMP POINT", basePoint)
  
//   const aPrivKey = generateSmallerPrimeNumber();
//   const bPrivKey = generateSmallerPrimeNumber();

//   console.log("A PRIVATE KEY", aPrivKey, "|", makeNumToHex(aPrivKey))
//   console.log("B PRIVATE KEY", bPrivKey, "|", makeNumToHex(bPrivKey))

//   const aPubKey = temp.multiplyPoint(basePoint, aPrivKey);
//   const bPubKey = temp.multiplyPoint(basePoint, bPrivKey);
  
//   console.log("A PUBLIC KEY", aPubKey, "|", aPubKey.getPointValue())
//   console.log("B PUBLIC KEY", bPubKey, "|", bPubKey.getPointValue())

//   const secretPoint = temp.getRandomPoint()

//   console.log("SECRET POINT", secretPoint, "|", secretPoint.getPointValue())

//   var k = generatePrimeNumber();
//   while (k < 1 || k > temp.pVal -1){
//     k = generatePrimeNumber();
//   }
//   console.log("K: ", k)
  
//   const pairPoint = temp.encryptECEG(k, basePoint, secretPoint, bPubKey)
//   const decryptedSecretPoint = temp.decryptECEG(bPrivKey, pairPoint)
//   console.log("DECRYPTED SECRET POINT", decryptedSecretPoint, "|", decryptedSecretPoint.getPointValue())

//   const pairPoint2 = temp.encryptECEG(k, basePoint, secretPoint, aPubKey)
//   const decryptedSecretPoint2 = temp.decryptECEG(aPrivKey, pairPoint2)
//   console.log("DECRYPTED SECRET POINT 2", decryptedSecretPoint2, "|", decryptedSecretPoint2.getPointValue())

  
//   if (secretPoint.getPointValue() == decryptedSecretPoint.getPointValue() && decryptedSecretPoint.getPointValue()  == decryptedSecretPoint2.getPointValue()){
//     console.log("BISAAA SAMA AAWOOAWOAWO")
//   } 

//   else {
//     incorrectCount +=1
//   }
// }

// console.log("The incorrect count:", incorrectCount)

