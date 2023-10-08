import db from '../utils/db'
import { Ship } from '@prisma/client'

export async function createShip(ship: Ship) {
  return await db.ship.create({
    data: ship,
  })
}

export async function updateShip(ship: Ship) {
  return await db.ship.update({
    where: {
      id: ship.id,
    },
    data: {
      name: ship.name,
      variant: ship.variant,
    },
  })
}

export async function getShips(id: string) {
  return await db.ship.findMany({
    where: {
      userId: id,
    },
  })
}

export async function deleteShip(id: string) {
  return await db.ship.delete({
    where: {
      id: id,
    },
  })
}
