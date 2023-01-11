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
        for(let relNeighbor of Point.adjacents(target)) {
            const neighbor = rect.wrap(relNeighbor)
            const isNeighborWater = surfaceLayer.isWater(neighbor)
            // set flow to nearest water neighbor
            if (isNeighborWater) {
                const direction = this.#getDirection(relTarget, relNeighbor)
                flowMap.set(...target, direction.id)
                basinMap.set(...target, fill.id)
                break
            }
        }
    }

    onFill(fill, relTarget, relSource) {
        const target = fill.context.rect.wrap(relTarget)
        const direction = this.#getDirection(relTarget, relSource)
        fill.context.flowMap.set(...target, direction.id)
        fill.context.basinMap.set(...target, fill.id)
    }

    onBlockedFill(fill, relTarget, relSource) {
        const target = fill.context.rect.wrap(relTarget)
        const relief = fill.context.reliefLayer.get(target)
        const isInvalidRelief = ! fill.context.validReliefIds.has(relief.id)
        const isLand = fill.context.surfaceLayer.isLand(target)
        if (isLand && isInvalidRelief) {
            fill.context.detectedBorders.add(target)
        }
    }

    #getDirection(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle)
    }
}