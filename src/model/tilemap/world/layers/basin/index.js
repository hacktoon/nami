import { Point } from '/src/lib/point'
import { Grid } from '/src/lib/grid'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'
import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'

import { buildBasin } from './fill'
import { Basin } from './data'


export class BasinLayer {
    #zoneRect

    // grid of basin ids
    #basinGrid

    // the walk distance of each basin starting from 0 (shore)
    // base value is 0
    // is used to determine river stretch
    #distanceGrid

    // grid of direction ids
    #erosionGrid

    // map basin type for creating rivers or other features
    #typeMap = new Map()

    // map a point to a basin zone paths
    #directionMaskGrid

    // map a point to a point index in a zone rect
    // convert index to x, y in a 10 x 10 grid
    #midpointIndexGrid

    // the points of basins that borders others basins
    #dividePoints

    constructor(rect, layers, zoneRect) {
        this.#zoneRect = zoneRect
        this.#dividePoints = new PointSet(rect)
        this.#distanceGrid = Grid.fromRect(rect, () => 0)
        this.#erosionGrid = Grid.fromRect(rect, () => null)
        this.#directionMaskGrid = new DirectionMaskGrid(rect)
        this.#midpointIndexGrid = Grid.fromRect(rect, () => null)
        const context = {
            rect,
            layers,
            typeMap: this.#typeMap,
            distanceGrid: this.#distanceGrid,
            dividePoints: this.#dividePoints,
            erosionGrid: this.#erosionGrid,
            directionMaskGrid: this.#directionMaskGrid,
            midpointIndexGrid: this.#midpointIndexGrid,
            zoneRect: this.#zoneRect
        }
        this.#basinGrid = buildBasin(context)
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
        const directionId = this.#erosionGrid.get(point)
        return Direction.fromId(directionId)
    }

    getDistance(point) {
        return this.#distanceGrid.get(point)
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

    drawPath(point, props, baseColor) {
        const {canvas, canvasPoint, tileSize} = props
        const basin = this.get(point)
        const lineWidth = 1
        const midSize = Math.round(tileSize / 2)
        const offset = Math.round(tileSize / 10)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc midpoint point on canvas
        const canvasMidpoint = Point.multiplyScalar(basin.midpoint, tileSize)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)
        const hexColor = "#069"
        const flowDirections = this.#directionMaskGrid.getAxis(point)
        // for each neighbor with a basin connection
        for(let flowAxis of flowDirections) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + flowAxis[0] * midSize,
                midCanvasPoint[1] + flowAxis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, lineWidth, hexColor)
        }
    }
}
