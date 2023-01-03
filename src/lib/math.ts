import type { Vec2d } from './types'

export function vec2d(): Vec2d {
  return { x: 0, y: 0 }
}

export function copy(from: Vec2d): Vec2d {
  return { x: from.x, y: from.y }
}

export function add(to: Vec2d, from: Vec2d): Vec2d {
  const tmp: Vec2d = copy(to)
  tmp.x += from.x
  tmp.y += from.y
  return tmp
}

export function sub(to: Vec2d, from: Vec2d): Vec2d {
  const tmp: Vec2d = copy(to)
  tmp.x -= from.x
  tmp.y -= from.y
  return tmp
}

export function mul(to: Vec2d, from: Vec2d): Vec2d {
  const tmp: Vec2d = copy(from)
  tmp.x = to.x * from.x
  tmp.y = to.y * from.y
  return tmp
}

export function round(v: Vec2d, decimals: number): Vec2d {
  const tmp = copy(v)
  tmp.x = round2dec(tmp.x, decimals)
  tmp.y = round2dec(tmp.y, decimals)
  return tmp
}

export function floor(v: Vec2d): Vec2d {
  return { x: Math.floor(v.x), y: Math.floor(v.y) }
}

export function magnitude(v: Vec2d): number {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
}

export function rndf(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function rndi(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function rndfVec2d(min: number, max: number): Vec2d {
  return { x: rndf(min, max), y: rndf(min, max) }
}

export function limit(n: number, max: number): number {
  return n >= Math.abs(max) ? max : n
}

export function limitv(v: Vec2d, max: Vec2d): Vec2d {
  return { x: limit(v.x, max.x), y: limit(v.y, max.y) }
}

export function wrap(vector: Vec2d, screen: Vec2d) {
  if (vector.x < 0) {
    vector.x = screen.x
  }
  if (vector.x > screen.x) {
    vector.x = 0
  }
  if (vector.y < 0) {
    vector.y = screen.y
  }
  if (vector.y > screen.y) {
    vector.y = 0
  }
}

export function mirrorWrap(vector: Vec2d, screen: Vec2d) {
  if (vector.x < 0) {
    vector.x = screen.x
    vector.y = screen.y - vector.y
  }
  if (vector.x > screen.x) {
    vector.x = 0
    vector.y = screen.y - vector.y
  }
  if (vector.y < 0) {
    vector.y = screen.y
    vector.x = screen.x - vector.x
  }
  if (vector.y > screen.y) {
    vector.y = 0
    vector.x = screen.x - vector.x
  }
}

export function round2dec(num: number, dec: number = 2): number {
  const exp = Math.pow(10, dec)
  return Math.round((num + Number.EPSILON) * exp) / exp
}

export function scalarMultiply(v: Vec2d, s: number): Vec2d {
  const tmp: Vec2d = copy(v)
  tmp.x *= s
  tmp.y *= s
  return tmp
}

export function smul(v: Vec2d, s: number): Vec2d {
  const tmp: Vec2d = copy(v)
  tmp.x *= s
  tmp.y *= s
  return tmp
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI)
}

export function withinBounds(v: Vec2d, maxBound: Vec2d, minBound: Vec2d = { x: 0, y: 0 }) {
  if (v.x > minBound.x) return false
  if (v.x < maxBound.x) return false
  if (v.y > minBound.y) return false
  if (v.y < maxBound.y) return false
  return true
}
