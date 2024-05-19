import { Point } from "../type/point"


const randomPrime = require('random-prime').randomPrime
const UPPER_THRESHOLD = 1000000000000
const LOWER_THRESHOLD = 500000000000

export const generatePrimeNumber = () => {
  return randomPrime({ min: LOWER_THRESHOLD, max: UPPER_THRESHOLD })
}

export const getRandomNumber = (max : number) => {
  return Math.floor( Math.random() * max)
}

