import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { buildBasinMap } from './fill'


export class BasinLayer {
    #basinMap = new PointMap()
    #erosionMap = new PointMap()
    #dividePoints = new PointSet()
    // the walk distance of each basin point to the shore
    // used to determine river stretch
    #distanceMap = new PointMap()

    constructor(rect, layers) {
        const context = {
            rect,
            surfaceLayer: layers.surface,
            dividePoints: this.#dividePoints,
            basinMap: this.#basinMap,
            erosionMap: this.#erosionMap,
            distanceMap: this.#distanceMap,
        }
        buildBasinMap(context)
    }

    get count() {
        return this.#basinMap.size
    }

    get(point) {
        const directionId = this.#erosionMap.get(point)
        const direction = Direction.fromId(directionId)
        const distance = this.getDistance(point)
        return {
            basin: this.#basinMap.get(point),
            erosion: direction,
            distance,
        }
    }

    getDividePoints() {
        return this.#dividePoints.points
    }

    getDistance(point) {
        return this.#distanceMap.get(point)
    }

    getText(point) {
        if (! this.#erosionMap.has(point))
            return ''
        const basin = this.get(point)
        const attrs = [
             `${basin.basin}`,
             `erosion=${basin.erosion.name}`,
             `distance=${basin.distance}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }
}
