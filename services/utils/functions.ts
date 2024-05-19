import { Point } from "../type/point"

export const calculateGradient = (p1 :Point, p2: Point) : number =>{
  return ((p2.y - p1.y)/ (p2.x - p1.x))
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

