import { eccBase } from "../type/eccBase";
import { Point } from "../type/point";
import { calculateGradient, calculateGradientHomogenous, isSquare, makeHexToNum, positiveModulo } from "../utils/functions";
import { generatePrimeNumber, getRandomNumber } from "../utils/number"

const INFINITY_POINT = new Point(Infinity, Infinity)

type IncrementingPoint = {
  exponent: number,
  point: Point
}

export class ECDH {
  public aVal : number
  public bVal : number
  public pVal : number
  public points : Array<Point>
  public basePoint : Point

  // The equation will always be y^2 = (x^3 + ax + b) mod p
  constructor() {
    this.aVal = generatePrimeNumber();
    this.bVal = generatePrimeNumber();
    this.pVal = generatePrimeNumber();
    this.points = []
    this.basePoint = new Point(0,0)
    this.calculatePoints();
  }

  public calculatePoints = () => {
    this.points = []

    // Check the requirements
    let check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    while (check == 0){
      this.aVal = generatePrimeNumber();
      this.bVal = generatePrimeNumber();
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

    // if (!this.checkEquation(x,y)){
    //   console.log("P1", p1)
    //   console.log("P2", p2)
    //   console.log("=== BORDER ===")
    // } 
    // else {
    //   console.log("TRUE")
    // }
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
    while (exp < n){
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
}


// var incorrectCount = 0
// for (var i = 0; i < 50; i++){
  // const temp = new ECDH()
  // console.log("a: "+temp.aVal+" b: "+temp.bVal +" p: "+temp.pVal)
  
  // const basePoint = temp.getRandomPoint()
  // console.log("TEMP POINT", basePoint)
  
  // const aPrivKey = generatePrimeNumber();
  // const bPrivKey = generatePrimeNumber();
  
  // const aPubKey = temp.multiplyPoint(basePoint, aPrivKey);
  // const bPubKey = temp.multiplyPoint(basePoint, bPrivKey);
  
  // console.log("A PUBLIC KEY", aPubKey)
  // console.log("B PUBLIC KEY", bPubKey)
  
  // const aSharedKey = temp.multiplyPoint(aPubKey, bPrivKey);
  // const bSharedKey = temp.multiplyPoint(bPubKey, aPrivKey);
  
  // console.log("A SHARED KEY", aSharedKey)
  // console.log("B SHARED KEY", bSharedKey)

  // const aSharedKeyVal = aSharedKey.getPointValue();
  // const bSharedKeyVal = bSharedKey.getPointValue();

  // console.log("A SHARED KEY VAL", aSharedKeyVal)
  // console.log("B SHARED KEY VAL", bSharedKeyVal)

  // const test = new Point(0,0)
  // test.setPointValue(aSharedKeyVal)
  // console.log(test)
  
//   if (aSharedKeyVal == bSharedKeyVal){
//     console.log("BISAAA SAMA AAWOOAWOAWO")
//   } 
//   else {
//     incorrectCount +=1
//   }
// }

// console.log("The incorrect count:", incorrectCount)

