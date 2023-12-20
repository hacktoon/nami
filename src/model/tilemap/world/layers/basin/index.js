import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'

import { BasinFill } from './fill'


export class BasinLayer {
    // map a point to a basin id
    #basinMap = new PointMap()

    // the walk distance of each basin shore to inner
    // used to determine river stretch
    #distanceMap = new PointMap()

    // map a point to a direction
    #erosionMap = new PointMap()

    // the highest points of basins that borders others basins
    #dividePoints = new PointSet()

    // a color for each basin
    #colorMap = new Map()

    constructor(rect, layers) {
        const context = {
            rect,
            layers: layers,
            basinMap: this.#basinMap,
            colorMap: this.#colorMap,
            distanceMap: this.#distanceMap,
            dividePoints: this.#dividePoints,
            erosionMap: this.#erosionMap,
        }
        // start filling from land borders
        let origins = context.layers.surface.landBorders
        const fill = new BasinFill()
        fill.start(origins, context)
    }

    get count() {
        return this.#basinMap.size
    }

    get(point) {
        return {
            id: this.#basinMap.get(point),
            distance: this.getDistance(point),
            erosion: this.#erosionMap.get(point),
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
        const direction = this.#erosionMap.get(point)
        return direction.axis
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
