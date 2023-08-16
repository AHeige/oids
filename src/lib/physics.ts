import type { Bounceable, Collidable, Damager, NonPlayerCharacter, Physical, Rotatable, SpaceObject } from './interface'
import { add, degToRad, info, limitv, magnitude, radToDeg, scalarMultiply, smul, sub, type Vec2d } from 'mathil'
import { getScreenFromCanvas } from './canvas_util'
import { renderHitExplosion } from './render/renderFx'
import { coolDown, decayDeadShots, handleHittingShot } from './mechanics'
import { angularFriction, collisionFrameDamage, linearFriction, missileDamageVelocityTransferFactor, screenPaddingFactor, timeScale } from './constants'
import type { Shape } from './shapes/Shape'

export function updateShape(shape: Shape, dt: number): void {
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2d = scalarMultiply(shape.velocity, deltaTime)
  const a: Vec2d = scalarMultiply(shape.acceleration, deltaTime)
  shape.velocity = add(shape.velocity, a)
  shape.position = add(shape.position, v)
  shape.acceleration = { x: 0, y: 0 }
  shape.velocity = limitv(shape.velocity, { x: 200, y: 200 })
}

export function updateShapes(shapes: Shape[], frameTimeMs: number): void {
  shapes.forEach((s) => {
    updateShape(s, frameTimeMs)
  })
}

export function updateSpaceObject(npc: SpaceObject | NonPlayerCharacter, dt: number, ctx: CanvasRenderingContext2D): void {
  // If assigning nan to npc.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2d = scalarMultiply(npc.velocity, deltaTime)
  const a: Vec2d = scalarMultiply(npc.acceleration, deltaTime)
  npc.velocity = add(npc.velocity, a)
  npc.position = add(npc.position, v)
  npc.acceleration = { x: 0, y: 0 }
  npc.velocity = limitv(npc.velocity, { x: 250, y: 250 })
  npc.angleDegree += npc.angularVelocity * deltaTime
  if (npc.angleDegree < 0) npc.angleDegree = 360
  if (npc.angleDegree > 360) npc.angleDegree = 0
  updateShots(npc, deltaTime, ctx)
}

export function updateNonPlayerCharacter(npc: NonPlayerCharacter, dt: number): void {
  // If assigning nan to npc.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2d = scalarMultiply(npc.velocity, deltaTime)
  const a: Vec2d = scalarMultiply(npc.acceleration, deltaTime)
  npc.velocity = add(npc.velocity, a)
  npc.position = add(npc.position, v)
  npc.acceleration = { x: 0, y: 0 }
  npc.velocity = limitv(npc.velocity, { x: 250, y: 250 })
  npc.angleDegree += npc.angularVelocity * deltaTime
  if (npc.angleDegree < 0) npc.angleDegree = 360
  if (npc.angleDegree > 360) npc.angleDegree = 0
}


export function updateSpaceObjects(npcs: (SpaceObject | NonPlayerCharacter)[], frameTimeMs: number, ctx: CanvasRenderingContext2D): void {
  npcs.forEach((npc) => {
    updateSpaceObject(npc, frameTimeMs, ctx)
  })
}

export function updateShots(npc: SpaceObject | NonPlayerCharacter, dts: number, ctx: CanvasRenderingContext2D): void {
  if (isNaN(dts)) return

  //  decayOffScreenShotsPadded(npc, getScreenFromCanvas(ctx), screenPaddingFactor)
  decayOffScreenShots(npc, getScreenFromCanvas(ctx))
  decayDeadShots(npc)

  coolDown(npc)
  if (npc.framesSinceLastShot > 0) {
    npc.framesSinceLastShot--
  }

  for (const shot of npc.shotsInFlight) {
    const v: Vec2d = scalarMultiply(shot.velocity, dts)
    const a: Vec2d = scalarMultiply(shot.acceleration, dts)
    shot.velocity = add(shot.velocity, a)
    shot.position = add(shot.position, v)
    shot.angleDegree += shot.angularVelocity * dts
    // alignVelocityToHeading(shot)
    alignHeadingToVelocity(shot)

    shot.acceleration = { x: 0, y: 0 }
    shot.armedDelay--

    // bounceSpaceObject(shot, screen, 1, 0, 0.7)
    //handleHittingShot(shot, ctx)
  }
  // removeShotsAfterBounces(npc, 2)
}

export function decayOffScreenShots(npc: SpaceObject | NonPlayerCharacter, screen: Vec2d) {
  npc.shotsInFlight = npc.shotsInFlight.filter(function (e) {
    return !offScreen(e.position, screen)
  })
}

export function decayOffScreenShotsPadded(npc: SpaceObject | NonPlayerCharacter, screen: Vec2d, padFac = 1) {
  npc.shotsInFlight = npc.shotsInFlight.filter(function (e) {
    return !offScreen_mm(e.position, scalarMultiply(screen, -padFac), scalarMultiply(screen, padFac))
  })
}

export function offScreen(v: Vec2d, screen: Vec2d) {
  if (v.x > screen.x) return true
  if (v.x < 0) return true
  if (v.y > screen.y) return true
  if (v.y < 0) return true
  return false
}

export function offScreen_mm(v: Vec2d, screen_min: Vec2d, screen_max: Vec2d) {
  if (v.x > screen_max.x) return true
  if (v.x < screen_min.x) return true
  if (v.y > screen_max.y) return true
  if (v.y < screen_min.y) return true
  return false
}

export function gravity(from: Physical, to: Physical, G = 1): void {
  // F = G((m0 * m1)/r^2)
  const m0: number = from.mass
  const m1: number = to.mass
  const v01: Vec2d = sub(from.position, to.position)
  const r: number = magnitude(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2d = scalarMultiply(v01, F)
  to.acceleration = add(to.acceleration, gvec)
}

export function friction(p: Physical & Rotatable) {
  // const head: Vec2d = getHeading(p)
  // const fric: Vec2d = mul(head, linearFriction)
  p.velocity = smul(p.velocity, linearFriction.x)
  p.angularVelocity = p.angularVelocity * angularFriction
}

export function applyFriction(npc: Physical, friction: number) {
  npc.velocity = scalarMultiply(npc.velocity, friction)
}

export function getHeading(p: Physical & Rotatable): Vec2d {
  return {
    x: Math.cos(degToRad(p.angleDegree)),
    y: Math.sin(degToRad(p.angleDegree)),
  }
}

export function headingFromAngle(angleDegree: number): Vec2d {
  return {
    x: Math.cos(degToRad(angleDegree)),
    y: Math.sin(degToRad(angleDegree)),
  }
}

export function alignHeadingToVelocity(p: Physical & Rotatable): void {
  p.angleDegree = radToDeg(Math.atan2(p.velocity.y, p.velocity.x))
}

// export function alignVelocityToHeading(p: Physical): void {
//   p.velocity = scalarMultiply(headingFromAngle(p.angleDegree), magnitude(p.velocity))
// }

export function isColliding(p0: Physical, p1: Physical): boolean {
  if (
    p0.position.x < p1.position.x + p1.size.x &&
    p0.position.x + p0.size.x > p1.position.x &&
    p0.position.y < p1.position.y + p1.size.y &&
    p0.position.y + p0.size.y > p1.position.y
  ) {
    return true
  }
  return false
}

export function isWithinRadius(p0: Physical, p1: Physical, radius: number): boolean {
  const d: number = magnitude(sub(p0.position, p1.position))
  if (d < radius) {
    return true
  }
  return false
}

export function edgeBounceSpaceObject(p: Physical & Damager & Bounceable, screen: Vec2d, energyFactor = 1, gap = 1, damageDeltaFactor: number) {
  if (p.position.x < gap) {
    p.velocity.x = -p.velocity.x * energyFactor
    p.position.x = gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
  if (p.position.x >= screen.x) {
    p.velocity.x = -p.velocity.x * energyFactor
    p.position.x = screen.x - gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
  if (p.position.y < gap) {
    p.velocity.y = -p.velocity.y * energyFactor
    p.position.y = gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
  if (p.position.y >= screen.y) {
    p.velocity.y = -p.velocity.y * energyFactor
    p.position.y = screen.y - gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
}

export function handleCollisions(spaceObjects: NonPlayerCharacter[], ctx: CanvasRenderingContext2D): void {
  resetCollisions(spaceObjects)
  for (const npc0 of spaceObjects) {
    if (npc0.isDead) continue

    for (const npc1 of spaceObjects) {
      if (npc1.isDead) continue
      //  if (isColliding(npc0, npc1) && npc0.name !== npc1.name) {
      if (isWithinRadius(npc0, npc1, npc1.hitRadius) && npc0.name !== npc1.name) {
        npc0.colliding = true
        npc1.colliding = true
        npc0.collidingWith.push(npc1)
        npc1.collidingWith.push(npc0)
        npc0.health -= collisionFrameDamage
        npc1.health -= collisionFrameDamage
        renderHitExplosion(npc0.position, ctx)
        renderHitExplosion(npc1.position, ctx)

        const f = -0.005
        npc0.velocity = smul(npc0.velocity, f * npc1.mass)
        npc1.velocity = smul(npc0.velocity, -f * npc0.mass)
      }
      for (const shot of npc0.shotsInFlight) {
        if (shot.armedDelay < 0) {
          const heading: Vec2d = scalarMultiply(headingFromAngle(shot.angleDegree), shot.damage * missileDamageVelocityTransferFactor)
          if (isWithinRadius(shot, npc1, npc1.hitRadius) && shot.didHit === false) {
            npc1.health -= shot.damage
            npc1.velocity = add(npc1.velocity, heading)
            npc1.lastDamagedByName = shot.ownerName
            shot.didHit = true
            if (npc1.health < 1) {
              if (addIfNotExists(npc1.name, npc0.kills) === true) {
                info('You killed: ' + npc1.name)
                npc0.killCount = npc0.kills.length
                npc1.killedByName = npc1.lastDamagedByName
                npc1.isDead = true
                npc1.health = 0
              }
            }
          }
        }

        handleHittingShot(shot, ctx)
      }
    }
  }
}

export function addIfNotExists(str: string, arr: string[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === str) {
      return false
    }
  }
  arr.push(str)
  return true
}

export function resetCollisions(spaceObjects: Collidable[]) {
  for (const npc of spaceObjects) {
    npc.colliding = false
    npc.collidingWith = []
  }
}
