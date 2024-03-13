import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { PairSet } from '/src/lib/map'

import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'


const EMPTY = null


export function buildRouteMap(context) {
    // used in block fill to detect other's fill id
    const {capitalPoints, cityPoints} = context
    const fillIdGrid = Grid.fromRect(context.rect, () => EMPTY)
    // save fill directions of each origin (city) for route building
    const fillDirectionGrid = Grid.fromRect(context.rect, () => EMPTY)
    const directionMaskGrid = new DirectionMaskGrid(context.rect)
    // used for road endpoints tracking
    const roadFillSet = new PairSet()
    // maps a fill id to a city point
    const fillOriginMap = new Map()
    const roadContext = {
        roadFillSet,
        fillDirectionGrid,
        directionMaskGrid,
        fillOriginMap,
        fillIdGrid,
        ...context
    }
    const fill = new RoadFill()
    const origins = [...capitalPoints, ...cityPoints]
    fill.start(origins, roadContext)
    return directionMaskGrid
}


class RoadFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {fillOriginMap, fillIdGrid} = fill.context
        // map the fill to the city point
        fillOriginMap.set(fill.id, fillPoint)
        fillIdGrid.set(fillPoint, fill.id)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {fillDirectionGrid, fillIdGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        fillDirectionGrid.set(fillPoint, direction)
        fillIdGrid.set(fillPoint, fill.id)
    }

    canFill(fill, fillPoint) {
        const {layers, fillIdGrid} = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const isEmpty = fillIdGrid.get(fillPoint) === EMPTY
        return isLand && isEmpty
    }

    onBlockedFill(fill, fillPoint, parentPoint) {
        const {
            fillIdGrid, fillOriginMap, directionMaskGrid, roadFillSet
        } = fill.context
        const blockedFillId = fillIdGrid.get(fillPoint)
        const parentFillId = fillIdGrid.get(parentPoint)
        const isSameFill = blockedFillId === parentFillId
        const hasRoad = (
            roadFillSet.has(blockedFillId, parentFillId)
            || roadFillSet.has(parentFillId, blockedFillId)
        )
        // return on first fill block. points are on shortest distance
        if (blockedFillId === EMPTY || isSameFill || hasRoad) {
            return
        }
        const fillTarget = fillOriginMap.get(blockedFillId)
        const parentTarget = fillOriginMap.get(parentFillId)
        const fillDirection = Point.directionBetween(fillPoint, parentPoint)
        const parentDirection = Point.directionBetween(parentPoint, fillPoint)
        // set same value to both ids
        roadFillSet.add(blockedFillId, parentFillId)
        // mark direction on point
        directionMaskGrid.add(fillPoint, fillDirection)
        directionMaskGrid.add(parentPoint, parentDirection)
        // create road points
        this.#buildRouteToCity(fill, fillPoint, fillTarget)
        this.#buildRouteToCity(fill, parentPoint, parentTarget)
    }

    #buildRouteToCity(fill, origin, target) {
        const {rect, fillDirectionGrid, directionMaskGrid} = fill.context
        const points = [origin]
        let nextPoint = origin
        const debug = Point.equals(origin, [46,57])
                    || Point.equals(origin, [46,56])
        if (debug) {
            console.log(`start from ${origin}`);
        }
        while (Point.differs(nextPoint, target)) {
            const direction = fillDirectionGrid.get(nextPoint)
            if (debug) {
                console.log(`from ${nextPoint} to ${direction.name}`);
            }
            // set road at direction
            directionMaskGrid.add(nextPoint, direction)
            // the next point is at <direction> of current point
            nextPoint = rect.wrap(Point.atDirection(nextPoint, direction))
            points.push(nextPoint)
        }
        return points
    }

}
