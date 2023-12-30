import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


const CHANCE = .1  // chance of fill growing
const GROWTH = 20  // make fill basins grow bigger than others


export class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, basinMap, distanceMap, erosionMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // create a basin midpoint
        // set basin id to spread on fill
        basinMap.set(wrappedFillPoint, fill.id)
        // initial distance is 1
        distanceMap.set(wrappedFillPoint, 1)
        // find neighbors to set initial erosion layout direction
        for(let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                const direction = getDirectionBetween(fillPoint, neighbor)
                erosionMap.set(wrappedFillPoint, direction.id)
                break  // stop on first water neighbor
            }
        }
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
        const wrappedPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // distance to source by point
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(wrappedPoint, currentDistance + 1)
        // use basin value from parent point
        basinMap.set(wrappedPoint, basinMap.get(wrappedParentPoint))
        // set midpoint for rendering  TODO: move to upper layer
        const direction = getDirectionBetween(fillPoint, parentPoint)
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
