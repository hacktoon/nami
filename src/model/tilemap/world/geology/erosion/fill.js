import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


export class ErosionFill extends ConcurrentFill {
    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    canFill(fill, relSidePoint, centerPoint, level) {
        const sidePoint = fill.context.rect.wrap(relSidePoint)
        const reliefId = fill.context.reliefLayer.get(sidePoint)
        const requiredReliefId = fill.context.requiredReliefId
        const isValidRelief = reliefId === requiredReliefId
        const isLand = fill.context.surfaceLayer.isLand(sidePoint)
        const hasNoBasin = ! fill.context.basinMap.has(...sidePoint)
        return isLand && hasNoBasin && isValidRelief
    }

    onFill(fill, relSidePoint, relCenterPoint, level) {
        const sidePoint = fill.context.rect.wrap(relSidePoint)
        fill.context.basinMap.set(...sidePoint, fill.id)
        if (relCenterPoint) {
            const directionId = this._getDirectionId(relSidePoint, relCenterPoint)
            fill.context.flowMap.set(...sidePoint, directionId)
        } else {
            // there's no center, this is the erosion fill origin
            // get nearer water neighbor
            // const directionId = this._getDirectionId(relCenterPoint, relSidePoint)
            if (sidePoint == 'water') {
                fill.context.flowMap.set(...sidePoint, directionId)

            }
        }
        // console.log(relCenterPoint, relSidePoint);
    }

    // check each neighbor to draw water flow map
    onBlockedFill(ref, relSidePoint, relCenterPoint, level) {
        const point = fill.context.rect.wrap(relSidePoint)
        ref.context.nextBorders.push(point)
    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}