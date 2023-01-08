import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


export class ErosionFill extends ConcurrentFill {
    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    canFill(fill, relFillPoint, relPreviousPoint, level) {
        const fillPoint = fill.context.rect.wrap(relFillPoint)
        const relief = fill.context.reliefLayer.get(fillPoint)
        const isRequiredRelief = relief.id === fill.context.requiredReliefId
        const isLand = fill.context.surfaceLayer.isLand(fillPoint)
        // use basin map to track which points were already visited
        const notVisited = ! fill.context.basinMap.has(...fillPoint)
        return notVisited && isLand && isRequiredRelief
    }

    // TODO: create onInitFill to avoid 'if (relPreviousPoint)'
    onFill(fill, relFillPoint, relPreviousPoint, level) {
        const fillPoint = fill.context.rect.wrap(relFillPoint)
        fill.context.basinMap.set(...fillPoint, fill.id)
        if (relPreviousPoint) {
            const directionId = this._getDirectionId(relFillPoint, relPreviousPoint)
            fill.context.flowMap.set(...fillPoint, directionId)
        }
    }

    // check each neighbor to draw water flow map
    onBlockedFill(fill, relFillPoint, relPreviousPoint, level) {
        const fillPoint = fill.context.rect.wrap(relFillPoint)
        const isFillWater = fill.context.surfaceLayer.isWater(fillPoint)
        if (isFillWater) {
            const directionId = this._getDirectionId(relFillPoint, relPreviousPoint)
            fill.context.flowMap.set(...fillPoint, directionId)
        } else {
            // point is blocked, mark as next border (origin) to start fill
            fill.context.nextBorders.push(fillPoint)
        }
    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}