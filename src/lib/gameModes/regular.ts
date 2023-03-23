import type { Game } from "../game"
import { setCanvasSize, getScreenRect, getScreenCenterPosition } from "../canvas_util"
import { initKeyControllers, spaceObjectKeyController } from "../input"
import { add, direction, rndfVec2d, rndi, sub } from "../math"
import { bounceSpaceObject, handleDeathExplosion } from "../mechanics"
import { friction, gravity, handleCollisions } from "../physics"
import { renderMoon, renderExplosionFrame, renderShip, renderSpaceObjectStatusBar, loadingText, renderViewport } from "../render"
import { fpsCounter } from "../time"
import { GameType, SpaceShape, type SpaceObject } from "../types"
import { getSerVer, initMultiplayer, registerServerUpdate } from "../webSocket"
import { randomAnyColor } from "../color"
import { test } from "../test"
import { explosionDuration } from "../constants"

let numberOfServerObjects = 0
let ops = 0

export function initRegularGame(game: Game): void {
  if (game.isRunning()) {
    return
  }

  // game.clearBodies()
  game.reset()

  game.type = GameType.MultiPlayer
  if (!test()) {
    return
  }

  loadingText("Loading...", game.ctx)
  initKeyControllers()

  const offset = 500

  game.localPlayer.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))

  //Local player init
  game.reset()
  game.localPlayer.mass = 0.1
  game.localPlayer.missileDamage = 5
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 100
  game.localPlayer.batteryLevel = 500
  game.localPlayer.steeringPower = 1.6
  game.localPlayer.enginePower = 0.25
  game.localPlayer.name = `P-${rndi(0, 900000)}`
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = "#f0f"
  game.localPlayer.isLocal = true
  game.localPlayer.hitRadius = 50

  console.log("Your ship name is: " + game.localPlayer.name + "\nAnd your color is: " + game.localPlayer.color)

  initMultiplayer()

  // const padding = 0
  // const pad = { x: padding, y: padding }
  // const scr = sub(getScreenRect(game.ctx), pad)

  const bodies: SpaceObject[] = []

  // game.remotePlayers = []
  game.all = game.all.concat(bodies)
  game.all.push(game.localPlayer)

  let startTime = 0

  registerServerUpdate((so: SpaceObject) => {
    if (performance.now() - startTime > 1000) {
      ops = numberOfServerObjects
      startTime = performance.now()
      numberOfServerObjects = 0
    } else {
      numberOfServerObjects++
    }
    for (let i = 0; i < game.remotePlayers.length; i++) {
      if (so.name === game.remotePlayers[i].name) {
        if (!so.online) {
          console.log(`${so.name} went offline`)
        }
        // update the remote player data object
        game.remotePlayers[i] = so
        return
        // if (so.sessionId === game.localPlayer.sessionId) {
        //   game.remotePlayers[i] = so
        //   return
        // }
      }
    }
    if (so.name !== game.localPlayer.name && so.sessionId === game.localPlayer.sessionId) {
      game.remotePlayers.push(so)
      console.log(`New ship online: ${so.name}`)
    }
  })
}

function handleRemotePlayers(remotes: SpaceObject[], ctx: CanvasRenderingContext2D): SpaceObject[] {
  remotes.forEach((so) => {
    so.framesSinceLastServerUpdate++
  })

  const stillPlaying = remotes.filter((so) => {
    return so.isPlaying === true
  })

  const stoppedPlaying = remotes.filter((so) => {
    return so.isPlaying === false
  })

  if (stoppedPlaying.length > 0) {
    stoppedPlaying.forEach((s) => {
      console.log(`${s.name} exited the game`)
    })
  }

  stillPlaying.forEach((so) => {
    if (so.shape === SpaceShape.Moon) {
      renderMoon(so, ctx)
    } else {
      if (so.health <= 0) {
        handleDeathExplosion(so, explosionDuration)
        if (!so.obliterated) {
          renderExplosionFrame(so, ctx)
        }
        return
      } else {
        renderViewport(ctx, so)
        renderShip(so, ctx, false)
      }
    }
  })

  return stillPlaying
}

export function renderFrame(game: Game, dt: number): void {
  const ctx = game.ctx
  setCanvasSize(game.ctx)
  game.localPlayer.viewport = getScreenRect(game.ctx)
  game.lightSource.position = game.localPlayer.position
  game.lightSource.direction = direction(game.localPlayer.angleDegree)

  game.remotePlayers = handleRemotePlayers(game.remotePlayers, ctx)

  // renderSpaceObjectStatusBar(game.remotePlayers, game.localPlayer, ctx)
  fpsCounter(ops, dt, getSerVer(), ctx)

  game.bodies.forEach((body) => {
    renderMoon(body, ctx)
  })

  if (game.localPlayer.health <= 0) {
    //Local player is dead
    game.localPlayer.isDead = true

    handleDeathExplosion(game.localPlayer, explosionDuration)
    if (!game.localPlayer.obliterated) {
      renderExplosionFrame(game.localPlayer, ctx)
    } else {
      setTimeout(() => {
        game.callBackWrapper()
      }, 1000)
    }

    return
  } else {
    renderShip(game.localPlayer, ctx, true)
  }
}

export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    spaceObjectKeyController(game.localPlayer, dt)
  }
  bounceSpaceObject(game.localPlayer, getScreenRect(game.ctx), 0.5, 0, 0)
  friction(game.localPlayer)

  if (game.remotePlayers.length === 0) {
    ops = 0
  }

  // game.bodies.forEach((body) => {
  //   game.bodies.forEach((other) => {
  //     if (body !== other) {
  //       gravity(body, other)
  //     }
  //   })

  //   gravity(body, game.localPlayer)

  //   game.localPlayer.shotsInFlight.forEach((shot) => {
  //     gravity(body, shot)
  //   })

  //   friction(body)
  //   bounceSpaceObject(body, getScreenRect(game.ctx), 0.4, 0, 0)
  // })

  game.remotePlayers = game.remotePlayers.filter((so) => {
    return so.online || so.isLocal
  })

  const currentSpaceObjects = game.all.concat(game.remotePlayers)

  handleCollisions(currentSpaceObjects, game.ctx)
}
