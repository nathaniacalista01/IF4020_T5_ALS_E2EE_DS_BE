import { makeHexToNum, makeNumToHex } from "../utils/functions"

export class Point {
  public x : number
  public y : number

  constructor (x : number, y: number){
    this.x = x
    this.y = y
  }

  setValue = (x: number, y: number) => {
    this.x = x 
    this.y = y
  }

  copyPoint = (p : Point) => {
    this.x = p.x
    this.y = p.y
  }

  isSamePoint = (p : Point) => {
    return this.x === p.x && this.y === p.y
  }

  isInverse = (p : Point, pVal: number) => {
    return this.x === p.x && this.y === Math.abs(pVal -p.y)
  }

  getPointValue = () => {
    // resulting hex
    const xHex = makeNumToHex(this.x).padStart(8, '0')
    const yHex = makeNumToHex(this.y).padStart(8, '0')
    return xHex + yHex
  }

  setPointValue = (val: string) => {
    const xHex = val.slice(0, 8)
    const yHex = val.slice(8, 16)
    this.x = makeHexToNum(xHex)
    this.y = makeHexToNum(yHex)
  }

  changeToInverse = () => {
    this.y *= -1
  }

}