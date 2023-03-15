import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { buildBasinMap } from './fill'


export class BasinLayer {
    #basinMap = new PointMap()
    #erosionMap = new PointMap()
    #dividePoints = new PointMap()

    constructor(rect, layers) {
        const context = {
            rect,
            surfaceLayer: layers.surface,
            dividePoints: this.#dividePoints,
            basinMap: this.#basinMap,
            erosionMap: this.#erosionMap,
        }
        buildBasinMap(context)
    }

    get count() {
        return this.#basinMap.size
    }

    get dividePoints() {
        const points = []
        let maxLength = 0
        this.#dividePoints.forEach((point, value) => {
            points.push(point)
            if (value > maxLength) {
                maxLength = value
            }
        })
        return points
    }

    get(point) {
        const directionId = this.#erosionMap.get(point)
        const direction = Direction.fromId(directionId)
        return {
            basin: this.#basinMap.get(point),
            erosion: direction,
        }
    }

    getText(point) {
        if (! this.#erosionMap.has(point))
            return ''
        const basin = this.get(point)
        const attrs = [
             `basin=${basin.basin}`,
             `erosion=${basin.erosion.name}`,
        ].join(',')
        return `Erosion(${attrs})`
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }
}
