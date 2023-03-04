import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'


const CHANCE = .1  // chance of growing
const GROWTH = 10  // make basins grow bigger than others


export function buildErosionMap(context) {
    // start filling from land borders
    let origins = context.surfaceLayer.landBorders
    const fill = new ErosionFill()
    fill.start(origins, context)
    console.log(context.riverSources.size);
}

class ErosionFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        const context = fill.context
        const adjacents = Point.adjacents(parentPoint)
        const wrappedPoint = context.rect.wrap(parentPoint)
        if (isRiverSource(context, adjacents, wrappedPoint)) {
            context.riverSources.add(wrappedPoint)
        }
        return adjacents
    }

    canFill(fill, fillPoint) {
        const {rect, surfaceLayer, flowMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const surface = surfaceLayer.get(wrappedFillPoint)
        // use flow map to track already visited points
        const isEmpty = ! flowMap.has(wrappedFillPoint)
        return ! surface.water && isEmpty
    }

    onInitFill(fill, fillPoint, neighbors) {
        // set the initial fill point to search water neighbor
        // considers if it's basin (has water neighbor) or inland
        const {rect, flowMap, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // already filled, exit
        if (flowMap.has(wrappedFillPoint)) {
            return
        }
        const waterNeighbor = this.#getWaterNeighbor(fill, neighbors)
        if (waterNeighbor) {
            const direction = getDirection(fillPoint, waterNeighbor)
            fill.context.riverSources.add(wrappedFillPoint)
            flowMap.set(wrappedFillPoint, direction.id)
            // it's next to water, use original fill.id
            basinMap.set(wrappedFillPoint, fill.id)
        } else {
            const landNeighbor = this.#getLandNeighbor(fill, neighbors)
            if (landNeighbor) {
                const direction = getDirection(fillPoint, landNeighbor)
                const wrappedNeighbor = rect.wrap(landNeighbor)
                flowMap.set(wrappedFillPoint, direction.id)
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
        const {rect, surfaceLayer, flowMap} = fill.context
        for(let neighbor of neighbors) {
            const wrappedNeighbor = rect.wrap(neighbor)
            const neighborSurface = surfaceLayer.get(wrappedNeighbor)
            // is land, check if has a flow already
            if (! neighborSurface.water && flowMap.has(wrappedNeighbor)) {
                return neighbor
            }
        }
    }

    onFill(fill, fillPoint, parentPoint) {
        const {rect, flowMap, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const _parentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        // set direction to source
        flowMap.set(wrappedFillPoint, directionToSource.id)
        // use basin value from parent point
        basinMap.set(wrappedFillPoint, basinMap.get(_parentPoint))
    }

    onBlockedFill(fill, fillPoint, parentPoint) {
        const wrappedParentPoint = fill.context.rect.wrap(parentPoint)
        fill.context.riverSources.add(wrappedParentPoint)
    }
}


function getDirection(sourcePoint, targetPoint) {
    const angle = Point.angle(sourcePoint, targetPoint)
    return Direction.fromAngle(angle)
}


function isRiverSource(context, adjacents, point) {
    for(let neighbor of adjacents) {
        const isNeighborLand = context.surfaceLayer.isLand(neighbor)
        // test if any land neighbors flows to point
        if (isNeighborLand) {
            return false
        }
    }
    return true
}

