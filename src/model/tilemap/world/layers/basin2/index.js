import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'
import { Color } from '/src/lib/color'

import { buildBasinMap } from './fill'


export class BasinLayer2 {
    // map a point to a basin id
    #basinMap = new PointMap()

    // map a point to a direction of a erosion path
    #erosionMap = new PointMap()

    // the walk distance of each basin point to the shore
    // used to determine river stretch
    #distanceMap = new PointMap()

    // the highest points of basins that borders others basins
    #dividePoints = new PointSet()

    // a color for each basin
    #colorMap = new Map()

    // can form a lake or spring (where a river may begin on a hill)
    #depressions = []

    constructor(rect, layers) {
        const context = {
            rect,
            surfaceLayer: layers.surface,
            basinMap: this.#basinMap,
            colorMap: this.#colorMap,
            erosionMap: this.#erosionMap,
            distanceMap: this.#distanceMap,
            dividePoints: this.#dividePoints,
            depressions: this.#depressions,
        }
        buildBasinMap(context)
    }

    get count() {
        return this.#basinMap.size
    }

    get(point) {
        const directionId = this.#erosionMap.get(point)
        return {
            id: this.#basinMap.get(point),
            erosion: Direction.fromId(directionId),
            distance: this.getDistance(point),
        }
    }

    getColor(point) {
        if (! this.#basinMap.has(point)) {
            return Color.DARKBLUE
        }
        const id = this.#basinMap.get(point)
        return this.#colorMap.get(id)
    }

    getErosionAxis(point) {
        const directionId = this.#erosionMap.get(point)
        const direction = Direction.fromId(directionId)
        return direction.axis
    }

    getDividePoints() {
        return this.#dividePoints.points
    }

    getDepressions() {
        return this.#depressions
    }

    getDistance(point) {
        return this.#distanceMap.get(point)
    }

    getText(point) {
        if (! this.#erosionMap.has(point))
            return ''
        const basin = this.get(point)
        const attrs = [
             `${basin.id}`,
             `erosion=${basin.erosion.name}`,
             `distance=${basin.distance}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }
}
