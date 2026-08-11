import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/math/direction'
import { Point } from '/src/lib/math/point'

import { Basin } from './type'


const NO_BASIN_ID = null
const FILL_CHANCE = .2
const FILL_GROWTH = 3


export class LandBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    onInitFill(fill, fillPoint) {
        this._fillBasin(fill, fillPoint, fill.opposite)
    }

    onFill(fill, fillPoint, parentPoint) {
        const { model } = fill.context
        // update distance to source at point
        const currentDistance = model.distance.get(parentPoint)
        model.distance.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        // will set the inflows directions
        const downstream = Point.directionBetween(parentPoint, fillPoint)
        model.erosionDirectionBitmask.add(parentPoint, downstream)
        // will set the outflow direction
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const { world, model, basinGrid } = fill.context
        const basin = Basin.parse(model.type.get(fill.id))
        if (basinGrid.get(fillPoint) !== NO_BASIN_ID)
            return false
        // avoid erosion flow on land borders
        if (world.surface.isBorder(fillPoint))
            return false
        // max basin reach inland
        const currentDistance = model.distance.get(parentPoint)
        if (currentDistance >= basin.reach) {
            return false
        }
        const target = world.surface.get(fillPoint)
        const parent = world.surface.get(parentPoint)
        // avoid fill if different types
        return target.type.isWater == parent.type.isWater
    }

    _fillBasin(fill, fillPoint, parentPoint) {
        const { world, model, basinGrid } = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        // set erosion flow to parent
        model.erosion.set(fillPoint, direction.id)
        // basin id is the same as fill id
        basinGrid.set(fillPoint, fill.id)
        // mark the direction the erosion flows
        model.erosionDirectionBitmask.add(fillPoint, direction)
    }
}


export class WaterBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const { world, model, basinGrid } = fill.context
        basinGrid.set(fillPoint, fill.id)  // basin id is the same as fill id
        // discover adjacent river and water tiles
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint)) {
                const sideDirection = Direction.fromId(model.erosion.get(sidePoint))
                const mouth = Point.atDirection(sidePoint, sideDirection)
                const receivesErosion = Point.equals(mouth, fillPoint)
                if (receivesErosion) {
                    model.erosionDirectionBitmask.add(fillPoint, direction)
                    model.erosion.set(fillPoint, direction.id)
                }
            } else {
                model.erosionDirectionBitmask.add(fillPoint, direction)
            }
        })
        // diagonals later, only to non-border water sides
        Point.diagonals(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint))
                return
            if (world.surface.isBorder(sidePoint)) {
                model.erosionDirectionBitmask.add(fillPoint, direction)
            }
        })
    }

    isEmpty(fill, point) {
        const { world, model, basinGrid } = fill.context
        const basinIsEmpty = basinGrid.get(point) === NO_BASIN_ID
        const isWater = world.surface.isWater(point)
        return isWater && basinIsEmpty
    }

    onFill(fill, fillPoint, parentPoint) {
        const { world, model, basinGrid } = fill.context
        const upstream = Point.directionBetween(fillPoint, parentPoint)
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            model.erosionDirectionBitmask.add(fillPoint, direction)
        })
        model.erosion.set(fillPoint, upstream.id)
        basinGrid.set(fillPoint, fill.id)
    }
}


// function _setCorners(world, model, fillPoint, direction) {
//     if (!Direction.isDiagonal(direction))
//         return
//     for (let sideDirection of Direction.getComponents(direction)) {
//         const sidePoint = Point.atDirection(fillPoint, sideDirection)
//         // mirror directions in one axis  '/'  =>  '\'
//         const x = sideDirection.axis[0] == 0 ? direction.axis[0] : -1 * direction.axis[0]
//         const y = sideDirection.axis[1] == 0 ? direction.axis[1] : -1 * direction.axis[1]
//         const sideCornerDir = Direction.fromAxis(x, y)
//         if (world.surface.isWater(fillPoint)) {
//             model.waterCorner .add(sidePoint, sideCornerDir)
//         } else {
//             model.riverCorner .add(sidePoint, sideCornerDir)
//         }
//     }
// }