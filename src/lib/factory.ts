import type { PhotonLaser, SpaceObject } from './interface'
import { MessageType, SpaceShape } from './interface'
import { rndf, rndi, type Vec2d } from 'mathil'
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from './constants'

export function newPhotonLaser(): PhotonLaser {
  const shot: PhotonLaser = {
    acceleration: { x: 0, y: 0 },
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 50,
    color: '#90d',
    damage: 5,
    deadFrameCount: 0,
    didHit: false,
    health: 100,
    isDead: false,
    mass: 1,
    obliterated: false,
    position: { x: 0, y: 0 },
    shotBlowFrame: 16,
    size: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    ownerName: '',
    lastDamagedByName: '',
    killedByName: '',
  }

  return shot
}

export function currentTimeDate(): string {
  return new Date().toLocaleString('sv-SE')
}

export function createSpaceObject(name = 'SpaceObject'): SpaceObject {
  const initVel: Vec2d = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2d = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
    messageType: MessageType.GAME_UPDATE,
    viewport: { x: 0, y: 0 },
    sessionId: '',
    acceleration: { x: 0, y: 0 },
    ammo: 1000,
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 500,
    batteryLevel: 500,
    booster: 2,
    bounceCount: 0,
    canonCoolDown: 0,
    canonCoolDownSpeed: 1.4,
    canonHeatAddedPerShot: 1.7,
    canonOverHeat: false,
    colliding: false,
    collidingWith: [],
    color: '#90d',
    damage: 5,
    deadFrameCount: 0,
    didHit: false,
    enginePower: 0.2,
    framesSinceLastServerUpdate: 0,
    framesSinceLastShot: 0,
    health: 100,
    hitRadius: 60,
    inverseFireRate: 6,
    isDead: false,
    isLocal: false,
    isPlaying: false,
    killedByName: '',
    kills: new Set<string>(),
    killCount: 0,
    mass: 1,
    missileDamage: 2,
    missileSpeed: 20,
    motivationLevel: 100,
    motivatorBroken: false,
    name: name,
    id: rndi(1, 500).toString(),
    obliterated: false,
    online: false,
    photonColor: '#0f0',
    position: initPos,
    serverVersion: '',
    shape: SpaceShape.SmallShip,
    shotBlowFrame: 16,
    shotsInFlight: [],
    shotsInFlightValues: [],
    shotsFiredThisFrame: false,
    shotsPerFrame: 1,
    size: { x: 100, y: 100 },
    steer: function (direction: number, deltaTime: number): void {
      throw new Error('Steer not implemented.')
    },
    steeringPower: 1.2,
    velocity: initVel,
    ownerName: '',
    lastDamagedByName: '',
    joinedGame: currentTimeDate(),
    lastMessage: '',
    readyToPlay: false,
    isHost: false,
    // dateTimeClient: undefined,
    // dateTimeServer: undefined,
    ping: false,
    pingResponse: false,
    pingId: '',
    hops: 0,
    ttl: 0,
    rtt: 0,
  }

  return spaceObject
}
