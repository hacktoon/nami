import { PointMap } from '/src/lib/point/map'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'
import { Rect } from '/src/lib/number'

import { buildBasin } from './fill'
import { Basin } from './data'


export class BasinLayer {
    // map a point to a basin id
    #basinMap

    // the walk distance of each basin shore to inner
    // used to determine river stretch
    #distanceMap

    // map a point to a direction
    #erosionMap

    // map basin type for creating rivers or other features
    #typeMap = new Map()

    // map a point to a terrain offset point index
    // convert index to x, y in a 10 x 10 grid
    #terrainMidpointMap

    // rect for mapping stored midpoint index
    #midpointRect = new Rect(10, 10)

    // the highest points of basins that borders others basins
    #dividePoints

    constructor(rect, layers) {
        this.#dividePoints = new PointSet(rect)
        this.#basinMap = new PointMap(rect)
        this.#distanceMap = new PointMap(rect)
        this.#erosionMap = new PointMap(rect)
        this.#terrainMidpointMap = new PointMap(rect)
        const context = {
            rect,
            layers: layers,
            basinMap: this.#basinMap,
            typeMap: this.#typeMap,
            distanceMap: this.#distanceMap,
            dividePoints: this.#dividePoints,
            erosionMap: this.#erosionMap,
            terrainMidpointMap: this.#terrainMidpointMap,
            midpointRect: this.#midpointRect,
        }
        // start filling from land borders
        buildBasin(layers.surface.landBorders, context)
    }

    get count() {
        return this.#basinMap.size
    }

    get(point) {
        return {
            id: this.#basinMap.get(point),
            type: this.getType(point),
            distance: this.getDistance(point),
            erosion: this.getErosion(point),
            midpoint: this.getMidpoint(point),
        }
    }

    getType(point) {
        const id = this.#basinMap.get(point)
        const typeId = this.#typeMap.get(id)
        return Basin.parse(typeId)
    }

    getThroughput(point) {
        return this.getType(point).throughput
    }

    getMidpoint(point) {
        const index = this.#terrainMidpointMap.get(point)
        const [x, y] = this.#midpointRect.indexToPoint(index)
        return [x / 10, y / 10]  // convert to fractions
    }

    getColor(point) {
        if (! this.#basinMap.has(point)) {
            return Color.DARKBLUE
        }
        return this.getType(point).color
    }

    getDividePoints() {
        return this.#dividePoints.points
    }

    isDivide(point) {
        return this.#dividePoints.has(point)
    }

    getErosion(point) {
        const directionId = this.#erosionMap.get(point)
        return Direction.fromId(directionId)
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
            `type=${basin.type ? basin.type.name : ''}`,
        ].join(',')
        return `Basin(${attrs})`
    }
}
