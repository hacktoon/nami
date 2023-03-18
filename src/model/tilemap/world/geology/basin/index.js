import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { buildBasinMap } from './fill'


export class BasinLayer {
    // map a point to a basin id
    #basinMap = new PointMap()

    // map a point to a direction of a erosion path
    #erosionMap = new PointMap()

    // the walk distance of each basin point to the shore
    // used to determine river stretch
    #distanceMap = new PointMap()

    // the highest points of basins that borders others basins
    #dividePoints = new PointSet()

    // can form a lake or spring (where a river may begin on a hill)
    #waterSources = []

    constructor(rect, layers) {
        const context = {
            rect,
            surfaceLayer: layers.surface,
            basinMap: this.#basinMap,
            erosionMap: this.#erosionMap,
            distanceMap: this.#distanceMap,
            dividePoints: this.#dividePoints,
            waterSources: this.#waterSources,
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

    getWaterSources() {
        return this.#waterSources
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
