import { Point } from "../type/point";
import { calculateGradient, generatePrimeNumber, getRandomNumber } from "../utils/number"


export class ECDH {
  public aVal : number
  public bVal : number

  // The equation will always be y^2 = x^3 + ax + b
  constructor() {
    this.aVal = getRandomNumber(50);
    this.bVal = getRandomNumber(50);

    // Check the requirements
    var check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    while (check == 0){
      this.aVal = getRandomNumber(50);
      this.bVal = getRandomNumber(50);
      check = 4*Math.pow(this.aVal, 3) + 27*Math.pow(this.bVal, 2)
    }
  }

  public setValue = (a: number, b: number) => {
    this.aVal = a;
    this.bVal = b;
  }

  public calculateCoorX = (p1: Point, p2: Point) => {
    const m = calculateGradient(p1, p2)
    return Math.pow(m, 2) - p1.x - p2.x
  }

  public calculateCoorY = (p1: Point, p2: Point) => {
    const m = calculateGradient(p1, p2)
    const xR = this.calculateCoorX(p1, p2)
    return m * (p1.x - xR) - p1.y
  }

  public addPoint = (p1: Point, p2: Point) => {
    const x = this.calculateCoorX(p1, p2)
    const y = this.calculateCoorY(p1, p2)
    return new Point(x, y)
  }
  
}