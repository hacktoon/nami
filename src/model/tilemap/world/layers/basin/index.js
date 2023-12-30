import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'

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

    // basin is adequate for rivers
    #riverBasinMap = new Map()

    constructor(rect, layers) {
        const context = {
            rect,
            layers: layers,
            basinMap: this.#basinMap,
            riverBasinMap: this.#riverBasinMap,
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
            erosion: Direction.fromId(this.#erosionMap.get(point)),
        }
    }

    getColor(point) {
        if (! this.#basinMap.has(point)) {
            return Color.DARKBLUE
        }
        let color = Color.DARKGREEN
        const distance = this.#distanceMap.get(point)
        return color.darken(distance * 10)
    }

    getDividePoints() {
        return this.#dividePoints.points
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }

    isRiverBasin(point) {
        const id = this.#basinMap.get(point)
        return this.#riverBasinMap.get(id)
    }

    getDistance(point) {
        return this.#distanceMap.get(point)
    }

    getText(point) {
        if (! this.#basinMap.has(point))
            return ''
        const basin = this.get(point)
        const attrs = [
            `id=${basin.id}`,
            `erosion=${basin.erosion.name}`,
            `distance=${basin.distance}`,
        ].join(',')
        return `Basin(${attrs})`
    }
}
