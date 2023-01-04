import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'

import { Terrain } from './data'


const EMPTY = null


export class ErosionFill extends ConcurrentFill {
    // override method
    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    // override method
    setValue(ref, point, level) {
        const wrappedPoint = this.context.rect.wrap(point)
        // set erosion
        const isBasinSet = this.context.basinMap.has(...wrappedPoint)
        const isLand = this.context.surfaceLayer.isLand(wrappedPoint)
        if (! isBasinSet && isLand)
            this.context.basinMap.set(...wrappedPoint, ref.id)
    }

    // override method
    isEmpty(ref, relSidePoint) {
        const validTerrain = this._isValidTerrain(ref, relSidePoint)
        const isEmpty = this._isCellEmpty(ref, relSidePoint)
        return isEmpty && validTerrain
    }

    _isCellEmpty(ref, relSidePoint) {
        const sidePoint = this.context.matrix.wrap(relSidePoint)
        const notWaterBorder = ! this.context.waterBorders.has(sidePoint)
        const notLandBorder = ! this.context.landBorders.has(sidePoint)
        const isEmpty = this.context.matrix.get(relSidePoint) === EMPTY
        return isEmpty && notWaterBorder && notLandBorder
    }

    // override method
    // check each neighbor to draw water flow map
    checkNeighbor(ref, relSidePoint, relCenterPoint) {
        const centerPoint = this.context.matrix.wrap(relCenterPoint)
        const sidePoint = this.context.matrix.wrap(relSidePoint)
        // only land tiles allowed
        if (this.context.surfaceLayer.isWater(centerPoint)) return

        const isSideWater = this.context.surfaceLayer.isWater(sidePoint)
        const isLandBorder = this.context.landBorders.has(centerPoint)
        // detect river mouth: land border with side water
        if (isLandBorder && isSideWater) {
            const directionId = this._getDirectionId(relCenterPoint, relSidePoint)
            // if (this.context.flowMap.has(...centerPoint)) return
            this.context.flowMap.set(...centerPoint, directionId)
        }

        const isSideLandBorder = this.context.landBorders.has(sidePoint)
        const isFlowSet = this.context.flowMap.has(...sidePoint)
        const directionId = this._getDirectionId(relSidePoint, relCenterPoint)

        // if (centerPoint[0] === 85 && centerPoint[1] === 70) {
        //     console.log(sidePoint, Direction.fromId(directionId));
        //     console.log(this.context.basinMap.get(...sidePoint));
        //     console.log(isFlowSet, isSideWater, isSideLandBorder);
        // }
        if (isFlowSet || isSideWater || isSideLandBorder) return

        this.context.flowMap.set(...sidePoint, directionId)

    }

    _getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}