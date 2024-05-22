type SchnorrKeys = {
  a: number;
  p: string;
  q: string;
};

// Precomputed number of a, p, and q
let schnorrKeys: SchnorrKeys = {
  a: 2,
  p: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F',
  q: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
};

export { schnorrKeys };
