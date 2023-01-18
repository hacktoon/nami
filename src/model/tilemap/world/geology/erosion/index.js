import { Point } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'

import { buildFlowMap } from './flow.fill'
import { buildTypeMap } from './type.fill'


export class ErosionLayer {
    #basinMap = new PointMap()
    #flowMap = new PointMap()
    #typeMap = new PointMap()
    #validReliefIds = new Set()
    #rect

    constructor(rect, reliefLayer) {
        this.#rect = rect
        const context = {
            rect,
            reliefLayer,
            validReliefIds: this.#validReliefIds,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            typeMap: this.#typeMap,
        }
        buildFlowMap(context)
        // buildTypeMap(context)
    }

    get basinCount() {
        return this.#basinMap.size
    }

    get(point) {
        const directionId = this.#flowMap.get(point)
        const basin = this.#basinMap.get(point)
        return basin ? {
            basin: this.#basinMap.get(point),
            flow: Direction.fromId(directionId),
        } : undefined
    }

    flowsTo(originPoint, targetPoint) {
        // checks if originPoint flow points to targetPoint
        const origin = this.#rect.wrap(originPoint)
        const directionId = this.#flowMap.get(origin)
        const direction = Direction.fromId(directionId)
        const pointAtDirection = Point.atDirection(originPoint, direction)
        return Point.equals(targetPoint, pointAtDirection)
    }
}
