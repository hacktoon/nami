import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


export class ErosionFill extends ConcurrentFill {
    getChance(fill) { return .1 }
    getGrowth(fill) { return 5 }

    getNeighbors(ref, relTarget) {
        return Point.adjacents(relTarget)
    }

    canFill(fill, relTarget, relSource) {
        const {rect, surfaceLayer, basinMap} = fill.context
        const target = rect.wrap(relTarget)
        const relief = fill.context.reliefLayer.get(target)
        const isValidRelief = fill.context.validReliefIds.has(relief.id)
        const isLand = surfaceLayer.isLand(target)
        // use basin map to track which points were already visited
        const notVisited = ! basinMap.has(...target)
        return notVisited && isLand && isValidRelief
    }

    onInitFill(fill, relTarget) {
        // set the initial basin point to search water neighbor
        const {rect, surfaceLayer, flowMap, basinMap} = fill.context
        const target = rect.wrap(relTarget)
        let hasWaterNeighbor = false
        let relLandNeighbor = null
        for(let relNeighbor of Point.adjacents(target)) {
            const neighbor = rect.wrap(relNeighbor)
            const isNeighborWater = surfaceLayer.isWater(neighbor)
            // set flow to nearest water neighbor
            if (isNeighborWater) {
                const direction = this.#getDirection(relTarget, relNeighbor)
                flowMap.set(...target, direction.id)
                // it's next to water, use original fill.id
                basinMap.set(...target, fill.id)
                hasWaterNeighbor = true
                break
            } else if (basinMap.has(...neighbor)) {
                relLandNeighbor = relNeighbor
            }
        }
        // has no water neighbor and is empty, set flow
        if (! hasWaterNeighbor && ! basinMap.has(...target)) {
            const direction = this.#getDirection(relTarget, relLandNeighbor)
            flowMap.set(...target, direction.id)
            basinMap.set(...target, basinMap.get(...rect.wrap(relLandNeighbor)))
        }
    }

    onFill(fill, relTarget, relSource) {
        const {rect, flowMap, basinMap} = fill.context
        const target = rect.wrap(relTarget)
        const direction = this.#getDirection(relTarget, relSource)
        flowMap.set(...target, direction.id)
        basinMap.set(...target, basinMap.get(...rect.wrap(relSource)))
    }

    onBlockedFill(fill, relTarget, relSource) {
        const target = fill.context.rect.wrap(relTarget)
        const relief = fill.context.reliefLayer.get(target)
        const isInvalidRelief = ! fill.context.validReliefIds.has(relief.id)
        const isLand = fill.context.surfaceLayer.isLand(target)
        if (isLand && isInvalidRelief) {
            fill.context.fillQueue.add(target)
        }
    }

    #getDirection(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle)
    }
}