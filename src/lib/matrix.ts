import { log } from "./log"

const mat3x3: number[][] = [
  [1.6543, 2, 3],
  [4, 0, 6],
  [7, 8, 9000]
]

const mat2x3: number[][] = [
  [102, 2, 3],
  [4, 0, 6.4]
]

const mat1x3: number[][] = [
  [102, 2, 30004]
]

const mat3x1: number[][] = [
  [102],
  [34],
  [1.34]
]

export function precision(a: number): number {
  if (!isFinite(a)) return 0
  let e = 1
  let p = 0
  while (Math.round(a * e) / e !== a) {
    e *= 10; p++
  }
  return p;
}

export function max(m: number[][]): number {
  let max = -Infinity
  m.forEach(r => {
    r.forEach(v => {
      if (v > max) max = v
    })
  })
  return max
}

export function min(m: number[][]): number {
  let min = Infinity
  m.forEach(r => {
    r.forEach(v => {
      if (v < min) min = v
    })
  })
  return min
}

export function maxDigits(m: number[][]): number {
  let mostDigi = 0
  m.forEach(r => {
    r.forEach(v => {
      if (v.toString().length - 1 > mostDigi) mostDigi = v.toString().length - 1
    })
  })
  return mostDigi
}

export function maxPrecision(m: number[][]): number {
  let maxPrec = 0
  m.forEach(r => {
    r.forEach(v => {
      if (precision(v) > maxPrec) maxPrec = precision(v)
    })
  })
  return maxPrec
}

export function printMatrix(m: number[][]) {
  const pad = Math.ceil(Math.log10(max(m))) + maxDigits(m)
  const fixedPoint = maxPrecision(m)
  const header = `== ${m.length} x ${m[0].length} (${max(m)}, ${min(m)}, ${pad}, ${fixedPoint}) ==`
  log(header)
  m.forEach(row => {
    log(
      row.map(v => {
      return v.toFixed(fixedPoint)
    }).map(String).map(v => {
      return (v + '').padStart(pad, ' ')
    }).join(', '))
  })
  log(new Array(header.length + 1).join('='))
}

export function test() {
  printMatrix(mat3x3)
  printMatrix(mat2x3)
  printMatrix(mat1x3)
  printMatrix(mat3x1)
  log(maxDigits(mat1x3))
}
