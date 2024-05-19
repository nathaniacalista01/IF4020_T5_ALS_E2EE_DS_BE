
export class Point {
  public x : number
  public y : number

  constructor (x : number, y: number){
    this.x = x
    this.y = y
  }

  setPoint = (p : Point) => {
    this.x = p.x
    this.y = p.y
  }
}