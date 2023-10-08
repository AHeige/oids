// import Retro from '../assets/ships/retro.svg'
// import Ship from '../assets/ships/ship.svg'
// import SpaceCraft from '../assets/ships/spaceCraft.svg'
// import Viking from '../assets/ships/viking.svg'

import { warn } from 'mathil'

const Retro = '../assets/ships/retro.svg'
const Ship = '../assets/ships/ship.svg'
const SpaceCraft = '../assets/ships/spaceCraft.svg'
const Viking = '../assets/ships/viking.svg'

export enum ShipVariant {
  Retro = 0,
  Ship,
  SpaceCraft,
  Viking,
}
export interface ShipBundle {
  name: string
  img: HTMLImageElement
  type: ShipVariant
  svgUrl: string
}

export function createShipBundle(variant: ShipVariant = ShipVariant.Retro, svgUrl: string = Retro): ShipBundle {
  const shipImage = new Image()
  shipImage.src = svgUrl

  return {
    name: '',
    img: shipImage,
    type: variant,
    svgUrl: svgUrl,
  }
}

export const Ships = {
  Retro: createShipBundle(ShipVariant.Retro, Retro),
  Ship: createShipBundle(ShipVariant.Retro, Ship),
  SpaceCraft: createShipBundle(ShipVariant.Retro, SpaceCraft),
  Viking: createShipBundle(ShipVariant.Retro, Viking),
}

export function getShipBundleCache(type: ShipVariant): ShipBundle {
  const ships = Object.values(Ships)
  for (let i = 0; i < ships.length; i++) {
    if (ships[i].type === type) return ships[i]
  }
  warn(`unknow ship type ${type}`)
  return Ships.Retro
}
