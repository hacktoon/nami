import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


export class ErosionFill extends ConcurrentFill {
    getChance(fill) { return .1 }
    getGrowth(fill) { return 5 }

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


    onInitFill(fill, relFillPoint, level) {
        const fillPoint = fill.context.rect.wrap(relFillPoint)
        fill.context.basinMap.set(...fillPoint, fill.id)
        for(let relNeighbor of Point.adjacents(relFillPoint)) {
            const neighbor = fill.context.rect.wrap(relNeighbor)
            const isSideWater = fill.context.surfaceLayer.isWater(neighbor)
            if (isSideWater) {
                const directionId = this._getDirectionId(relFillPoint, relNeighbor)
                fill.context.flowMap.set(...fillPoint, directionId)
                break
            }
        }
    }

    onFill(fill, relFillPoint, relPreviousPoint, level) {
        const fillPoint = fill.context.rect.wrap(relFillPoint)
        fill.context.basinMap.set(...fillPoint, fill.id)
        const directionId = this._getDirectionId(relFillPoint, relPreviousPoint)
        fill.context.flowMap.set(...fillPoint, directionId)
    }

    // check each neighbor to draw water flow map
    onBlockedFill(fill, relFillPoint, relPreviousPoint, level) {
        const fillPoint = fill.context.rect.wrap(relFillPoint)
        const isBorder = fill.context.reliefLayer.isBorder(fillPoint)
        const isLand = fill.context.surfaceLayer.isLand(fillPoint)
        if (isLand && ! isBorder) {
            fill.context.nextBorders.push(fillPoint)
        }
    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}