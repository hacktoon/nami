import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'
import { Grid } from '/src/lib/grid'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'

import { buildBasin } from './fill'
import { Basin } from './data'


export class BasinLayer {
    #zoneRect

    // grid of basin ids
    #basinGrid

    // the walk distance of each basin starting from 0 (shore)
    // base value is 0
    // is used to determine river stretch
    #distanceMap

    // grid of direction ids
    #erosionMap

    // map basin type for creating rivers or other features
    #typeMap = new Map()

    // map a point to a point index in a zone rect
    // convert index to x, y in a 10 x 10 grid
    #midpointIndexGrid

    // the highest points of basins that borders others basins
    #dividePoints

    constructor(rect, layers, zoneRect) {
        this.#zoneRect = zoneRect
        this.#dividePoints = new PointSet(rect)
        this.#basinGrid = Grid.fromRect(rect, () => null)
        this.#distanceMap = Grid.fromRect(rect, () => 0)
        this.#erosionMap = Grid.fromRect(rect, () => null)
        this.#midpointIndexGrid = Grid.fromRect(rect, () => null)
        const context = {
            rect,
            layers: layers,
            basinGrid: this.#basinGrid,
            typeMap: this.#typeMap,
            distanceMap: this.#distanceMap,
            dividePoints: this.#dividePoints,
            erosionMap: this.#erosionMap,
            midpointIndexGrid: this.#midpointIndexGrid,
            zoneRect: this.#zoneRect
        }
        // start filling from land borders
        buildBasin(layers.surface.landBorders, context)
    }

    get count() {
        return 2 //this.#basinGrid.size
    }

    get(point) {
        return {
            id: this.#basinGrid.get(point),
            type: this.getType(point),
            distance: this.getDistance(point),
            erosion: this.getErosion(point),
            midpoint: this.getMidpoint(point),
        }
    }

    getType(point) {
        const id = this.#basinGrid.get(point)
        const typeId = this.#typeMap.get(id)
        return Basin.parse(typeId)
    }

    getThroughput(point) {
        return this.getType(point).throughput
    }

    getMidpoint(point) {
        const index = this.#midpointIndexGrid.get(point)
        const [x, y] = this.#zoneRect.indexToPoint(index)
        return [x / 10, y / 10]  // convert to fractions
    }

    getColor(point) {
        if (! this.#basinGrid.get(point)) {
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
        if (! this.#basinGrid.get(point))
            return 'submarine'
        const basin = this.get(point)
        const attrs = [
            `id=${basin.id}`,
            `erosion=${basin.erosion.name}`,
            `distance=${basin.distance}`,
            `type=${basin.type ? basin.type.name : ''}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    draw(point, props, baseColor) {
        const {canvas, canvasPoint, tileSize} = props
        const river = this.get(point)
        const riverWidth = Math.round(river.stretch.width * tileSize)
        const midSize = Math.round(tileSize / 2)
        const offset = Math.round(tileSize / 10)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const meanderOffsetPoint = Point.multiplyScalar(river.meander, tileSize)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        for(let flowAxis of river.flowDirections) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + flowAxis[0] * midSize,
                midCanvasPoint[1] + flowAxis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, riverWidth, hexColor)
        }
    }
}
