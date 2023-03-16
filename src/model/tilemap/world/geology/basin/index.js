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

    get(point) {
        const directionId = this.#erosionMap.get(point)
        const hasDivide = this.#dividePoints.has(point)
        const length = hasDivide ? this.#dividePoints.get(point) : 0
        const direction = Direction.fromId(directionId)
        return {
            basin: this.#basinMap.get(point),
            erosion: direction,
            length,
        }
    }

    getDividePoints() {
        // return points sorted by basin length
        // in ascending order using indexes of entries
        const entries = []
        this.#dividePoints.forEach((point, length) => {
            entries.push([point, length])
        })
        return entries.sort((a, b) => a[1] - b[1]).map(p => p[0])
    }

    getText(point) {
        if (! this.#erosionMap.has(point))
            return ''
        const basin = this.get(point)
        const attrs = [
             `${basin.basin}`,
             `erosion=${basin.erosion.name}`,
             `length=${basin.length}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }
}
