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


export class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, basinMap, typeMap, distanceMap, erosionMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)

        // count neighbor water types
        let total = {lake: 0, sea: 0, ocean: 0}
        const waterNeighbors = neighbors.filter(neighbor => {
            if (layers.surface.isLake(neighbor)) total.lake += 1
            else if (layers.surface.isSea(neighbor)) total.sea += 1
            else if (layers.surface.isOcean(neighbor)) total.ocean += 1
            return layers.surface.isWater(neighbor)
        })
        // set erosion direction, use first water neighbor
        const direction = getDirectionBetween(fillPoint, waterNeighbors[0])
        erosionMap.set(wrappedFillPoint, direction.id)
        // set basin type
        let type = OldBasin
        //  has 1 ocean/sea neighbor
        if (total.lake == 0 && (total.sea == 1 || total.ocean == 1))
            type = RiverBasin
        else if (total.sea > 0)
            type = SeaBasin
        else if (total.lake > 0)
            type = LakeBasin

        typeMap.set(fill.id, type.id)
        // set basin id to spread on fill
        basinMap.set(wrappedFillPoint, fill.id)
        // initial distance from mouth is 1
        distanceMap.set(wrappedFillPoint, 1)
    }

    buildType() {

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

    canFill(fill, fillPoint) {
        const {rect, layers, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        if (layers.surface.isWater(wrappedFillPoint))
            return false
        return ! basinMap.has(wrappedFillPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            rect, basinMap, distanceMap, erosionMap
        } = fill.context
        const direction = getDirectionBetween(fillPoint, parentPoint)
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


function getDirectionBetween(sourcePoint, targetPoint) {
    // need to get unwrapped points to get real angle
    const angle = Point.angle(sourcePoint, targetPoint)
    return Direction.fromAngle(angle)
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
