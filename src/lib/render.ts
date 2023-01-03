import type { SpaceObject, Vec2d } from './types'
import { add, magnitude, rndi, round2dec, scalarMultiply } from './math'
import { canvasBackgroundColor, frontVersion, screenScale, timeScale } from './constants'
import { getScreenFromCanvas, getScreenRect, to_string } from './utils'

export function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = canvasBackgroundColor
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function renderFrameInfo(fps: number, frameTimeMs: number, ctx: CanvasRenderingContext2D) {
  const xpos: number = 25
  const dec: number = 1
  const screen: Vec2d = getScreenRect(ctx)
  const ratio: number = round2dec(screen.x / screen.y, 2)
  ctx.font = 'bold 40px courier'
  ctx.fillStyle = '#ccc'
  ctx.fillText('FPS: ' + round2dec(fps, dec), xpos, 50)
  ctx.fillText('DT:  ' + round2dec(frameTimeMs, dec) + 'ms', xpos, 100)
  ctx.fillText('DTS: ' + round2dec(frameTimeMs * timeScale, dec), xpos, 150)
  ctx.fillText('RES: ' + screen.x + 'x' + screen.y + ' (x' + screenScale + ', ' + ratio + ')', xpos, 200)
  renderProgressBar({ x: xpos, y: 250 }, 'Load', frameTimeMs, 50, ctx, -40)
  ctx.fillStyle = '#444'
  ctx.fillText('' + frontVersion, screen.x - frontVersion.length * 27, 50)
}

export function renderSpaceObjectStatusBar(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  const screen: Vec2d = getScreenFromCanvas(ctx)
  const ypos: number = screen.y - 20
  const offset: number = 600
  ctx.font = 'bold 40px courier'
  ctx.fillStyle = '#ccc'
  ctx.fillText('SIF: ' + so.shotsInFlight.length, 25 + offset * 0, ypos)
  ctx.fillText(so.health + 'hp', 25 + offset * 0.5, ypos)
  ctx.fillText('Ammo: ' + so.ammo, 25 + offset * 0.9, ypos)
  ctx.fillText(round2dec(magnitude(so.velocity), 1) + ' pix/fra', 25 + offset * 1.5, ypos)
  ctx.fillText('P' + to_string(so.position, 0), 25 + offset * 2.1, ypos)
  ctx.fillText('V' + to_string(so.velocity, 1), 25 + offset * 2.8, ypos)
  ctx.fillText('A' + to_string(scalarMultiply(so.acceleration, 1000), 1), 25 + offset * 3.5, ypos)
  renderProgressBar({ x: 25 + offset * 4.5, y: ypos - 50 }, 'Health', so.health, 1200, ctx, 200)
  renderProgressBar({ x: 25 + offset * 4.5, y: ypos - 120 }, 'SIF', so.shotsInFlight.length, 4000, ctx, -2800)
  renderProgressBar({ x: 25 + offset * 4.5, y: ypos - 190 }, 'Ammo', so.ammo, 50000, ctx, 5000)
  renderProgressBar({ x: 25 + offset * 4.5, y: ypos - 260 }, 'Speed', magnitude(so.velocity), 20, ctx, -15)
  renderProgressBar({ x: 25 + offset * 4.5, y: ypos - 330 }, 'Acc.', magnitude(so.acceleration), 0.1, ctx, -0.05)
  renderProgressBar({ x: 25 + offset * 4.5, y: ypos - 400 }, 'Fuel', so.fuel, 5000, ctx, 500)
}

export function renderVector(
  v: Vec2d,
  origin: Vec2d,
  ctx: CanvasRenderingContext2D,
  scale: number = 10000,
  color: string = '#fff',
  offset: Vec2d = { x: 0, y: 0 }
) {
  ctx.save()
  ctx.translate(origin.x + offset.x, origin.y + offset.y)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 5
  ctx.moveTo(0, 0)
  ctx.lineTo(scale * v.x, scale * v.y)
  ctx.stroke()
  ctx.restore()
}

export function renderShip(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  let scale: number = 2
  let shipSize = { x: 40, y: 80 }
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.strokeStyle = so.color
  ctx.lineWidth = 5
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)

  // Hull
  ctx.strokeStyle = so.colliding ? '#f00' : so.color
  ctx.fillStyle = so.colliding ? '#f00' : so.color
  ctx.moveTo(0, (-shipSize.y / 2) * scale)
  ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo(0, (-shipSize.y / 2) * scale)

  // // Canons
  // const cannonWidth: number = 10
  // const cannonStart: number = 15
  // const cannonEnd: number = 40
  // ctx.moveTo(cannonWidth, cannonStart)
  // ctx.lineTo(cannonWidth, -cannonEnd)
  // ctx.moveTo(-cannonWidth, cannonStart)
  // ctx.lineTo(-cannonWidth, -cannonEnd)
  ctx.stroke()

  // // Tower
  // ctx.beginPath()
  // ctx.arc(0, 20, 16, 0, Math.PI * 2)
  // ctx.fill()

  // ctx.font = "30px courier"
  // ctx.fillStyle = "#ccc"
  // ctx.fillText("SIF: " + so.shotsInFlight.length, 40, -120)
  // ctx.fillText('P' + to_string(so.position), 40, -80)
  // ctx.fillText('V' + to_string(so.velocity, 2), 40, -40)
  // ctx.fillText('A' + to_string(scalarMultiply(so.acceleration, 1), 3), 40, 0)
  // ctx.fillText(so.health + 'hp', 40, 40)
  // ctx.fillText(round2dec(magnitude(so.velocity), 1) + ' pix/fra', 40, 80)

  // Restore drawing
  ctx.restore()

  // Draw shots
  renderShot(so, ctx)
}

export function renderExplosionFrame(pos: Vec2d, ctx: any) {
  let offset: number = 7
  let minSize: number = 1
  let maxSize: number = 14
  ctx.save()
  ctx.translate(pos.x, pos.y)
  for (let c of ['#ff0', '#f00', '#ee0', '#e00', '#dd0', '#d00', '#008', '#000', '#444', '#fee', '#f66,', '#f99', '#fbb']) {
    let center = add({ x: 0, y: 0 }, { x: rndi(-offset, offset), y: rndi(-offset, offset) })
    let size = add({ x: 0, y: 0 }, { x: rndi(minSize, maxSize), y: rndi(minSize, maxSize) })
    ctx.fillStyle = c
    ctx.fillRect(center.x, center.y, size.x, size.y)
  }
  ctx.restore()
}

export function renderShot(so: SpaceObject, ctx: any) {
  for (let shot of so.shotsInFlight) {
    if (shot.didHit) continue
    if (Math.random() > 0.99) {
      ctx.fillStyle = shot.armedDelay < 0 ? '#00f' : '#fff'
    } else if (Math.random() > 0.985) {
      ctx.fillStyle = shot.armedDelay < 0 ? '#ff0' : '#fff'
    } else if (Math.random() > 0.975) {
      ctx.fillStyle = shot.armedDelay < 0 ? '#f00' : '#fff'
    } else {
      ctx.fillStyle = shot.armedDelay < 0 ? shot.color : '#fff'
    }
    ctx.save()
    ctx.translate(shot.position.x, shot.position.y)
    ctx.rotate(((90 + shot.angleDegree) * Math.PI) / 180)
    ctx.fillRect(-shot.size.x / 2, -shot.size.y / 2, shot.size.x, shot.size.y)
    // ctx.beginPath()
    // ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    // ctx.fill()
    ctx.restore()
  }
}

export function renderMoon(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(s.position.x, s.position.y)
  ctx.beginPath()
  ctx.fillStyle = s.color
  ctx.arc(0, 0, 20, 0, Math.PI * 2, false)
  ctx.fill()
  ctx.restore()
}

export function renderProgressBar(pos: Vec2d, label: string, amount: number, max: number, ctx: CanvasRenderingContext2D, redLevel: number = 60): void {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  const linew: number = 8
  const w: number = 500
  const h: number = 50
  ctx.lineWidth = linew
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'

  if (amount < redLevel || (redLevel < 0 && amount > Math.abs(redLevel))) {
    ctx.fillStyle = '#f22'
  } else if (redLevel < 0 && amount < Math.abs(redLevel)) {
    ctx.fillStyle = '#2f2'
  }
  const percent: string = round2dec((100 * amount) / max, 0) + '%'

  if (amount < 0) {
    amount = 0
  }

  let p: number = (w * amount) / max - linew
  if (p < 0) p = 0
  if (p > w) {
    ctx.fillStyle = '#f22'
  }

  ctx.strokeRect(0, 0, w, h)

  ctx.fillRect(Math.floor(linew / 2), Math.floor(linew / 2), p, h - linew)

  ctx.font = 'bold 30px courier'
  ctx.fillStyle = '#35f'
  ctx.fillText(percent, w / 2 - 10 * percent.length, linew + Math.floor(h / 2) + 1)
  ctx.fillText(label, linew * 2, linew + Math.floor(h / 2) + 1)

  ctx.restore()
}
