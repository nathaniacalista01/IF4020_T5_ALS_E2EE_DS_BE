import { isPrime, modExp } from "../services/utils/number";

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

const generatePrime = (threshold: number): number => {
  let prime = Math.floor(Math.random() * (threshold - 2)) + 2;
  while (!isPrime(prime)) {
    prime = Math.floor(Math.random() * (threshold - 2)) + 2;
  }
  return prime;
};

const generateSchnorrParams = (): SchnorrKeys => {
  const threshold = 1000000;
  let p: number;
  let q: number;
  const a = 2;

  do {
    q = generatePrime(Math.floor(threshold / 10));
    p = generatePrime(threshold);
  } while ((p - 1) % q !== 0 || modExp(a, q, p) !== 1);

  return {
    a: a,
    p: `0x${p.toString(16).toUpperCase()}`,
    q: `0x${q.toString(16).toUpperCase()}`
  };
};


const initializeSchnorrParams = () => {
  schnorrKeys = generateSchnorrParams();
  console.log("Schnorr keys: ", schnorrKeys);
}

export { schnorrKeys, initializeSchnorrParams };
