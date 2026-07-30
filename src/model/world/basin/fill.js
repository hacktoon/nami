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
        const { surveyMap } = fill.context
        const survey = surveyMap.get(fill.id)
        // the basin opposite border is the parentPoint
        this._fillBasin(fill, fillPoint, survey.oppositeBorder)
    }

    onFill(fill, fillPoint, parentPoint) {
        const { model } = fill.context
        // update distance to source at point
        const currentDistance = model.distance.get(parentPoint)
        model.distance.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        // will set the inflows directions
        const downstream = Point.directionBetween(parentPoint, fillPoint)
        model.directionBitmap.add(parentPoint, downstream)
        // will set the outflow direction
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const { world, model } = fill.context
        const basin = Basin.parse(model.type.get(fill.id))
        if (model.basin.get(fillPoint) !== NO_BASIN_ID)
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
        const { world, model } = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        // set erosion flow to parent
        model.erosion.set(fillPoint, direction.id)
        // basin id is the same as fill id
        model.basin.set(fillPoint, fill.id)
        // mark the direction the erosion flows
        model.directionBitmap.add(fillPoint, direction)
        _setCorner(world, model, fillPoint, direction)
    }
}


export class WaterBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const { world, model } = fill.context
        model.basin.set(fillPoint, fill.id)  // basin id is the same as fill id
        // discover adjacent river and water tiles
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint)) {
                const sideDirection = Direction.fromId(model.erosion.get(sidePoint))
                const mouth = Point.atDirection(sidePoint, sideDirection)
                if (Point.equals(mouth, fillPoint)) {
                    model.directionBitmap.add(fillPoint, direction)
                    model.erosion.set(fillPoint, direction.id)
                }
            } else {
                model.directionBitmap.add(fillPoint, direction)
            }
        })
        // diagonals later, only to non-border water sides
        Point.diagonals(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint))
                return
            _setCorner(world, model, fillPoint, direction)
            if (world.surface.isBorder(sidePoint)) {
                model.directionBitmap.add(fillPoint, direction)
            }
        })
    }

    isEmpty(fill, point) {
        const { world, model } = fill.context
        const basinIsEmpty = model.basin.get(point) === NO_BASIN_ID
        const isWater = world.surface.isWater(point)
        return isWater && basinIsEmpty
    }

    onFill(fill, fillPoint, parentPoint) {
        const { world, model } = fill.context
        const upstream = Point.directionBetween(fillPoint, parentPoint)
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            model.directionBitmap.add(fillPoint, direction)
        })
        model.erosion.set(fillPoint, upstream.id)
        model.basin.set(fillPoint, fill.id)
        // set water corners
        _setCorner(world, model, fillPoint, upstream)
    }
}


function _setCorner(world, model, fillPoint, direction) {
    if (!Direction.isDiagonal(direction))
        return
    for (let sideDirection of Direction.getComponents(direction)) {
        const sidePoint = Point.atDirection(fillPoint, sideDirection)
        // mirror directions in one axis  '/'  =>  '\'
        const x = sideDirection.axis[0] == 0 ? direction.axis[0] : -1 * direction.axis[0]
        const y = sideDirection.axis[1] == 0 ? direction.axis[1] : -1 * direction.axis[1]
        const sideCornerDir = Direction.fromAxis(x, y)
        if (world.surface.isWater(fillPoint)) {
            model.waterCornerBitmap.add(sidePoint, sideCornerDir)
        } else {
            model.riverCornerBitmap.add(sidePoint, sideCornerDir)
        }
    }
}