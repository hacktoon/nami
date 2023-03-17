import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


const CHANCE = .1  // chance of growing
const GROWTH = 10  // make basins grow bigger than others


export function buildBasinMap(context) {
    // start filling from land borders
    const {surfaceLayer, basinHeightMap} = context
    let origins = surfaceLayer.landBorders
    const fill = new BasinFill()
    fill.start(origins, context)
}

class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        const {rect, heightMap, basinHeightMap, dividePoints} = fill.context
        const adjacents = Point.adjacents(parentPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
            let basinHeight = basinHeightMap.get(fill.id) ?? 0
            // update max basin height
            if (fill.level > basinHeight) {
                basinHeightMap.set(fill.id, fill.level)
            }
            // add height by point
            heightMap.set(wrappedParentPoint, fill.level)
            dividePoints.add(wrappedParentPoint)
        }
        return adjacents
    }

    canFill(fill, fillPoint) {
        const {rect, surfaceLayer, erosionMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const surface = surfaceLayer.get(wrappedFillPoint)
        // use flow map to track already visited points
        const isEmpty = ! erosionMap.has(wrappedFillPoint)
        return ! surface.water && isEmpty
    }

    onInitFill(fill, fillPoint, neighbors) {
        // set the initial fill point on river mouth
        const {rect, erosionMap, heightMap, basinMap, distanceMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        for(let neighbor of neighbors) {
            const neighborSurface = fill.context.surfaceLayer.get(neighbor)
            // set flow to nearest water neighbor
            if (neighborSurface.water) {
                const direction = getDirection(fillPoint, neighbor)
                erosionMap.set(wrappedFillPoint, direction.id)
                // it's next to water, use original fill.id
                basinMap.set(wrappedFillPoint, fill.id)
                // initial distance is 0
                distanceMap.set(wrappedFillPoint, 0)
            }
        }
        heightMap.set(wrappedFillPoint, fill.level)
    }


    onFill(fill, fillPoint, parentPoint) {
        const {rect, erosionMap, heightMap, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        // set direction to source
        erosionMap.set(wrappedFillPoint, directionToSource.id)
        // use basin value from parent point
        basinMap.set(wrappedFillPoint, basinMap.get(wrappedParentPoint))
        heightMap.set(wrappedParentPoint, fill.level)
    }
}


function getDirection(sourcePoint, targetPoint) {
    // need to get unwrapped points to get real angle
    const angle = Point.angle(sourcePoint, targetPoint)
    return Direction.fromAngle(angle)
}


function isDivide(context, neighbors) {
    const {rect, erosionMap, surfaceLayer} = context
    // it's a river source if every neighbor is water
    let waterNeighborCount = 0
    let blockedCount = 0
    for(let neighbor of neighbors) {
        const isNeighborWater = surfaceLayer.isWater(neighbor)
        const isOccupied = erosionMap.has(rect.wrap(neighbor))
        waterNeighborCount += isNeighborWater ? 1 : 0
        blockedCount += (isNeighborWater || isOccupied) ? 1 : 0
    }
    const allNeighborsWater = waterNeighborCount === neighbors.length
    const allNeighborsBlocked = blockedCount === neighbors.length
    return allNeighborsWater || allNeighborsBlocked
}
