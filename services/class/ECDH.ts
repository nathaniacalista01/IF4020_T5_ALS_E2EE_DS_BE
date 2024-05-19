import { Point } from "../type/point";
import { calculateGradient, calculateGradientHomogenous, isSquare, positiveModulo } from "../utils/functions";
import { generatePrimeNumber, getRandomNumber } from "../utils/number"


export class ECDH {
  public aVal : number
  public bVal : number
  public pVal : number
  public points : Array<Point>

  // The equation will always be y^2 = x^3 + ax + b
  constructor() {
    this.aVal = generatePrimeNumber();
    this.bVal = generatePrimeNumber();
    this.pVal = generatePrimeNumber();
    this.points = []

    // Check the requirements
    var check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    while (check == 0){
      this.aVal = generatePrimeNumber();
      this.bVal = generatePrimeNumber();
      check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    }

    for( var i = 0; i < this.pVal-1; i++){
      var res = this.calculateY(i);
      if (res % 1 == 0){
        this.points.push(new Point(i, res))
        this.points.push(new Point(i, this.pVal - res))
      }
    }
  }

  public setValue = (a: number, b: number, p : number) => {
    this.aVal = a;
    this.bVal = b;
    this.pVal = p;
  }

  public calculateY = (x: number) : number => {
    return Math.sqrt( (Math.pow(x, 3) + this.aVal*x + this.bVal) % this.pVal);
  }

  public checkEquation = (x: number, y: number) : boolean => {
    return this.calculateY(x) === y;
  }

  public calculateCoorX = (p1: Point, p2: Point) => {
    var m = p1.isSamePoint(p2) ? calculateGradientHomogenous(p1, this.aVal, this.pVal) : calculateGradient(p1, p2, this.pVal)
    return positiveModulo((Math.pow(m, 2) - p1.x - p2.x), this.pVal)
  }

  public calculateCoorY = (p1: Point, p2: Point) => {
    var m = p1.isSamePoint(p2) ? calculateGradientHomogenous(p1, this.aVal, this.pVal) : calculateGradient(p1, p2, this.pVal)
    const xR = this.calculateCoorX(p1, p2)
    return positiveModulo((m * (p1.x - xR) - p1.y), this.pVal)
  }

  public addPoint = (p1: Point, p2: Point) => {
    const x = this.calculateCoorX(p1, p2)
    const y = this.calculateCoorY(p1, p2)
    console.log(this.checkEquation(x, y));
    return new Point(x, y)
  }

  public multiplyPoint = (n : number, p : Point) : Point => {
    var tempPoint = new Point(0,0)
    tempPoint.copyPoint(p);
    for (var i = 0; i < n; i++){
      tempPoint = this.addPoint(tempPoint, p);
    }
    return tempPoint
  }

  public getRandomPoint = () => {
    return Math.floor(Math.random() * this.points.length)
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

var temp = new ECDH()
console.log("a: "+temp.aVal+" b: "+temp.bVal +" p: "+temp.pVal)
var p1 = temp.points[temp.getRandomPoint()]
console.log(p1)
var p2 = temp.points[temp.getRandomPoint()]
console.log(p2)
var p3 = temp.addPoint(p1, p2);
console.log(p3)
console.log(temp.searchPoint(p3))