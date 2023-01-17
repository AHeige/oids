import type { Vec2d } from './types'
import { floor } from './math'
import { screenScale } from './constants'

export const getScreenRect = (ctx: CanvasRenderingContext2D): Vec2d => {
  return { x: ctx.canvas.width, y: ctx.canvas.height }
}

export function setCanvasSize(ctx: CanvasRenderingContext2D): void {
  const vw: number = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh: number = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  ctx.canvas.width = vw * screenScale
  ctx.canvas.height = vh * screenScale
  console.log({ vw, vh })
}

export function getScreenCenterPosition(ctx: CanvasRenderingContext2D): Vec2d {
  return floor({ x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 })
}

export function getScreenFromCanvas(ctx: CanvasRenderingContext2D): Vec2d {
  return { x: ctx.canvas.width, y: ctx.canvas.height }
}

export function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  return <CanvasRenderingContext2D>canvas.getContext('2d')
}

