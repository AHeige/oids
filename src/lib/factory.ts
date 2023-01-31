import type { SpaceObject, Vec2d } from './types'
import { SpaceShape } from './types'
import { rndf, rndi } from './math'
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from './constants'
import type { Button90Config } from '../components/interface'
import { getScreenCenterPosition, getScreenRect } from './canvas_util'

export function createSpaceObject(name = 'SpaceObject'): SpaceObject {
  const initVel: Vec2d = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2d = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
    mass: 1,
    size: { x: 100, y: 100 },
    color: '#90d',
    position: initPos,
    velocity: initVel,
    acceleration: { x: 0, y: 0 },
    name: name,
    angleDegree: -90,
    angularVelocity: 0,
    health: 100,
    killCount: 0,
    batteryLevel: 500,
    enginePower: 0.2,
    steeringPower: 1.2,
    ammo: 1000,
    shotsInFlight: [],
    missileDamage: 2,
    canonCoolDown: 0,
    canonOverHeat: false,
    colliding: false,
    collidingWith: [],
    damage: 5,
    armedDelay: 2,
    bounceCount: 0,
    didHit: false,
    shotBlowFrame: 16,
    steer: function (direction: number, deltaTime: number): void {
      throw new Error('Steer not implemented.')
    },
    motivatorBroken: false,
    motivationLevel: 100,
    online: false,
    isLocal: false,
    shape: SpaceShape.SmallShip,
    hitRadius: 60,
    serverVersion: '',
    booster: 2,
    framesSinceLastShot: 0,
    missileSpeed: 20,
    canonCoolDownSpeed: 1.4,
    canonHeatAddedPerShot: 1.7,
    inverseFireRate: 6,
    shotsPerFrame: 1,
    photonColor: '#0f0',
    deadFrameCount: 0,
    dontRenderMe: false,
  }

  return spaceObject
}

export function defaultPlayerSpaceObject(ctx: CanvasRenderingContext2D): SpaceObject {
  const so: SpaceObject = createSpaceObject()
  const offset = getScreenRect(ctx)
  so.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  so.mass = 0.1
  so.angleDegree = -120
  so.health = 50
  so.steeringPower = 0.55
  so.enginePower = 0.025
  so.name = `P-${rndi(0, 900000)}`
  so.color = randomAnyColor()
  so.photonColor = '#f0f'
  so.isLocal = true
  return so
}

export function createButton90Config(
  buttonText = 'Button90',
  clickCallback = () => {
    alert(`${buttonText} selected`)
  },
  selected = false
): Button90Config {
  return {
    buttonText: buttonText,
    clickCallback: clickCallback,
    selected: selected,
  }
}
function add(arg0: Vec2d, arg1: any): Vec2d {
  throw new Error('Function not implemented.')
}

function rndfVec2d(arg0: number, offset: any): any {
  throw new Error('Function not implemented.')
}

function randomAnyColor(): string {
  throw new Error('Function not implemented.')
}

