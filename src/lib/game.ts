import { GameType, type SpaceObject, type KeyFunctionMap, type NonPlayerCharacter, type UIStyle } from './interface'
import { getContext } from './canvas_util'
import { LightSource, LineSegment } from './shapes'
import { renderLoop } from './time'
// import * as WelcomeScreen from './gameModes/welcomeScreen'
import type { Shape } from './shapes/Shape'
import { initRegularGame, nextFrame, renderFrame } from './gameModes/regular'
import type { OidsSocket } from './websocket/ws'
import { getDefaultTheme } from '../pages/GamePage/components/Game/Utils/getTheme'

export class Game {
  websocket: OidsSocket
  testShapes: Shape[] = []
  private running = false
  type: GameType = GameType.SinglePlayer
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  localPlayer: SpaceObject
  remotePlayers: SpaceObject[] = []
  lightSource = new LightSource({ x: 1000, y: 750 }, { x: 1, y: 0 }, 45, 1)
  segments: LineSegment[] = []
  gameOver = false
  bodies: (SpaceObject | NonPlayerCharacter) [] = []
  all: (SpaceObject | NonPlayerCharacter)[] = []
  shouldSendToServer = false
  hasCalledCallback = false
  keyFuncMap: KeyFunctionMap
  OnDeadLocalPlayerCallBack: () => void
  stopper: (() => Promise<number>) | null = null
  serverVersion = '_unknown_server_version_'
  style: UIStyle = getDefaultTheme()

  constructor(
    _canvas: HTMLCanvasElement,
    _localPlayer: SpaceObject,
    _websocket: OidsSocket,
    keyFuncMap: KeyFunctionMap,
    _OnDeadLocalPlayerCallBack: () => void
  ) {
    this.canvas = _canvas
    this.localPlayer = _localPlayer
    this.websocket = _websocket
    this.OnDeadLocalPlayerCallBack = _OnDeadLocalPlayerCallBack
    this.ctx = getContext(this.canvas)
    this.keyFuncMap = keyFuncMap
  }

  isRunning(): boolean {
    return this.running
  }

  shouldQuit(): boolean {
    return !this.running
  }

  stopGame = async (): Promise<void> => {
    this.running = false
    this.shouldSendToServer = false
    this.localPlayer.isPlaying = false
    if (this.stopper) {
      await this.stopper()
    } else {
      console.error('stopper not init')
    }
  }

  startSingleplayer(): void {
    console.log('starts single')
  }

  startWelcomeScreen(): void {
    // WelcomeScreen.initWelcomeScreen(this)
    // this.stopper = renderLoop(this, WelcomeScreen.renderFrame, WelcomeScreen.nextFrame)
  }

  clearBodies(): void {
    this.bodies = []
    this.all = []
  }

  callBackWrapper(): void {
    if (!this.hasCalledCallback) {
      this.hasCalledCallback = true
      this.OnDeadLocalPlayerCallBack()
    }
  }

  reset(): void {
    this.hasCalledCallback = false
    this.localPlayer.isDead = false
    this.localPlayer.obliterated = false
    this.localPlayer.deadFrameCount = 0
    this.clearBodies()
  }

  startMultiplayer(): void {
    // init a regular game
    this.shouldSendToServer = true
    this.localPlayer.isPlaying = true
    initRegularGame(this)

    this.running = true

    // start the animation loop
    this.stopper = renderLoop(this, renderFrame, nextFrame)
  }

  startGame(initFn: (g: Game) => void, renderFn: (game: Game, dt: number) => void, nextFn: (game: Game, dt: number) => void): void {
    this.shouldSendToServer = true
    this.localPlayer.isPlaying = true
    initFn(this)

    this.running = true

    // start the animation loop
    this.stopper = renderLoop(this, renderFn, nextFn)
  }
}
