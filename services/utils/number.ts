import { Point } from "../type/point"


// const randomPrime = require('random-prime').randomPrime
const UPPER_THRESHOLD = 5000000
const LOWER_THRESHOLD = 2500000

const UPPER_SMALLER_THRESHOLD = 10000
const LOWER_SMALLER_THRESHOLD = 5000

export const getRandomNumber = (max : number) => {
  return Math.floor( Math.random() * max)
}

export function isPrime(n: number, k: number = 10): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0) return false;

  // Write n-1 as 2^r * d
  let r = 0;
  let d = n - 1;
  while (d % 2 === 0) {
      r += 1;
      d >>= 1;
  }

  function millerRabinTest(a: number, d: number, n: number, r: number): boolean {
      let x = modExp(a, d, n);
      if (x === 1 || x === n - 1) return true;
      for (let i = 0; i < r - 1; i++) {
          x = modExp(x, 2, n);
          if (x === n - 1) return true;
      }
      return false;
  }

  for (let i = 0; i < k; i++) {
      const a = Math.floor(Math.random() * (n - 3)) + 2;
      if (!millerRabinTest(a, d, n, r)) return false;
  }
  return true;
}

export function modExp(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      exp = exp >> 1;
      base = (base * base) % mod;
  }
  return result;
}

export function generatePrimeNumber(): number {
  while (true) {
      const n = Math.floor(Math.random() * (LOWER_THRESHOLD - UPPER_THRESHOLD + 1)) + UPPER_THRESHOLD;
      if (isPrime(n)) {
          return n;
      }
  }
}

export function generateSmallerPrimeNumber() : number {
  while (true) {
    const n = Math.floor(Math.random() * (LOWER_SMALLER_THRESHOLD - UPPER_SMALLER_THRESHOLD + 1)) + UPPER_SMALLER_THRESHOLD;
    if (isPrime(n)) {
        return n;
    }
  }
}

// The one using Library
// export const generatePrimeNumber = () => {
//   return randomPrime({ min: LOWER_THRESHOLD, max: UPPER_THRESHOLD })
// }
