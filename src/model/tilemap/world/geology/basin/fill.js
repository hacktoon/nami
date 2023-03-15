import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


const CHANCE = .1  // chance of growing
const GROWTH = 10  // make basins grow bigger than others


export function buildBasinMap(context) {
    // start filling from land borders
    let origins = context.surfaceLayer.landBorders
    const fill = new BasinFill()
    fill.start(origins, context)
}

class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        const {rect, dividePoints} = fill.context
        const adjacents = Point.adjacents(parentPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
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
        // set the initial fill point to search water neighbor
        // considers if it's basin (has water neighbor) or inland
        const {rect, erosionMap, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // already filled, exit
        if (erosionMap.has(wrappedFillPoint)) {
            return
        }
        const waterNeighbor = this.#getWaterNeighbor(fill, neighbors)
        if (waterNeighbor) {
            const direction = getDirection(fillPoint, waterNeighbor)
            erosionMap.set(wrappedFillPoint, direction.id)
            // it's next to water, use original fill.id
            basinMap.set(wrappedFillPoint, fill.id)
        } else {
            const landNeighbor = this.#getLandNeighbor(fill, neighbors)
            if (landNeighbor) {
                const direction = getDirection(fillPoint, landNeighbor)
                const wrappedNeighbor = rect.wrap(landNeighbor)
                erosionMap.set(wrappedFillPoint, direction.id)
                // set land neighbor basin
                basinMap.set(wrappedFillPoint, basinMap.get(wrappedNeighbor))
            }
        }
    }

    #getWaterNeighbor(fill, neighbors) {
        for(let neighbor of neighbors) {
            const neighborSurface = fill.context.surfaceLayer.get(neighbor)
            // set flow to nearest water neighbor
            if (neighborSurface.water) {
                return neighbor
            }
        }
    }

    #getLandNeighbor(fill, neighbors) {
        // need to read neighbors on start fill to get parent flow
        const {rect, surfaceLayer, erosionMap} = fill.context
        for(let neighbor of neighbors) {
            const wrappedNeighbor = rect.wrap(neighbor)
            const neighborSurface = surfaceLayer.get(wrappedNeighbor)
            // is land, check if has a flow already
            if (! neighborSurface.water && erosionMap.has(wrappedNeighbor)) {
                return neighbor
            }
        }
    }

    onFill(fill, fillPoint, parentPoint) {
        const {rect, erosionMap, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        // set direction to source
        erosionMap.set(wrappedFillPoint, directionToSource.id)
        // use basin value from parent point
        basinMap.set(wrappedFillPoint, basinMap.get(wrappedParentPoint))
    }
}


function getDirection(sourcePoint, targetPoint) {
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
