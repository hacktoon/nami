import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'

import {
    OldBasin,
    SeaBasin,
    LakeBasin,
    RiverBasin,
} from './data'

const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others


export function buildBasin(originPoints, context) {
    const fill = new BasinFill()
    fill.start(originPoints, context)
}


class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }

    getGrowth(fill) {
        const typeId = fill.context.typeMap.get(fill.id)
        if (typeId == OldBasin.id) return 5
        if (typeId == LakeBasin.id) return 0
        if (typeId == SeaBasin.id) return 0
        return GROWTH
    }

    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, basinMap, typeMap, distanceMap, erosionMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // count neighbor water types
        let total = {lake: 0, sea: 0, ocean: 0}
        const waterNeighbors = neighbors.filter(neighbor => {
            if (layers.surface.isOcean(neighbor)) total.ocean += 1
            else if (layers.surface.isSea(neighbor)) total.sea += 1
            else if (layers.surface.isLake(neighbor)) total.lake += 1
            return layers.surface.isWater(neighbor)
        })
        // set erosion direction, use first water neighbor
        const direction = Point.directionBetween(fillPoint, waterNeighbors[0])
        erosionMap.set(wrappedFillPoint, direction.id)
        // set basin type
        typeMap.set(fill.id, buildType(total))
        // set basin id to spread on fill
        basinMap.set(wrappedFillPoint, fill.id)
        // initial distance from mouth is 0
        distanceMap.set(wrappedFillPoint, 0)
    }

    getNeighbors(fill, parentPoint) {
        const {rect, dividePoints} = fill.context
        const adjacents = Point.adjacents(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
            const wrappedParentPoint = rect.wrap(parentPoint)
            dividePoints.add(wrappedParentPoint)
        }
        return adjacents
    }

    canFill(fill, fillPoint, parentPoint) {
        const {rect, layers, basinMap} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        if (layers.surface.isWater(wrappedPoint))
            return false
        return ! basinMap.has(wrappedPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            rect, basinMap, distanceMap, erosionMap
        } = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        const wrappedPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // distance to source by point
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(wrappedPoint, currentDistance + 1)
        // use basin value from parent point
        const parentBasin = basinMap.get(wrappedParentPoint)
        basinMap.set(wrappedPoint, parentBasin)
        // set erosion flow to parent
        erosionMap.set(wrappedPoint, direction.id)
    }
}


function buildType(total) {
    let type = OldBasin
    const oneWaterSide = total.lake == 1 || total.sea == 1 || total.ocean == 1
    // try sea and lake first
    if (total.ocean > 0 && oneWaterSide)
        type = RiverBasin
    else if (total.sea > 0)
        type = SeaBasin
    else if (total.lake > 0)
        type = LakeBasin
    else if (oneWaterSide)
        type = RiverBasin
    return type.id
}


function isDivide(context, neighbors) {
    const {rect, layers, erosionMap} = context
    // it's a river source if every neighbor is water
    let waterNeighborCount = 0
    let blockedCount = 0
    for(let neighbor of neighbors) {
        const isNeighborWater = layers.surface.isWater(neighbor)
        const isOccupied = erosionMap.has(rect.wrap(neighbor))
        waterNeighborCount += isNeighborWater ? 1 : 0
        blockedCount += (isNeighborWater || isOccupied) ? 1 : 0
    }
    const allNeighborsWater = waterNeighborCount === neighbors.length
    const allNeighborsBlocked = blockedCount === neighbors.length
    return allNeighborsWater || allNeighborsBlocked
}
