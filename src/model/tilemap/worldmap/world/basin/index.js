import { Point } from '/src/lib/geometry/point'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { DirectionBitMaskGrid } from '/src/model/tilemap/lib/bitmask'

import {
    buildBasinModel,
    buildMidpointGrid
} from './model'
import {
    Basin,
    WaterBasin,
    EMPTY,
    DiffuseLandBasin,
} from './type'


export class BasinLayer {
    #world
    #zoneRect

    // grid of basin ids
    #basinGrid

    #midpointGrid

    // the walk distance of each basin starting from shore
    // initial value is 0, used to determine river stretch
    #distanceGrid

    // grid of direction ids
    #erosionGrid

    // map basin type for creating rivers or other features
    #typeMap = new Map()

    // map a point to a basin zone direction bitmask
    #directionBitmask

    constructor(context) {
        const {rect, world, zoneRect} = context
        this.#world = world
        this.#zoneRect = zoneRect
        this.#distanceGrid = Grid.fromRect(rect, () => 0)
        this.#erosionGrid = Grid.fromRect(rect, () => null)
        this.#midpointGrid = buildMidpointGrid(context)
        this.#directionBitmask = new DirectionBitMaskGrid(rect)
        this.#basinGrid = buildBasinModel({
            ...context,
            typeMap: this.#typeMap,
            erosionGrid: this.#erosionGrid,
            distanceGrid: this.#distanceGrid,
            directionBitmask: this.#directionBitmask,
        })
    }

    has(point) {
        return this.#basinGrid.get(point) != EMPTY
    }

    get(point) {
        const id = this.#basinGrid.get(point)
        const typeId = this.#typeMap.get(id)
        const directionId = this.#erosionGrid.get(point)
        const midpointIndex = this.#midpointGrid.get(point)
        return {
            id,
            type: Basin.parse(typeId) || WaterBasin,
            distance: this.#distanceGrid.get(point) || 0,
            midpoint: this.#zoneRect.indexToPoint(midpointIndex),
            erosion: Direction.fromId(directionId),
        }
    }

    canCreateRiver(point) {
        const id = this.#basinGrid.get(point)
        const typeId = this.#typeMap.get(id)
        const basinType = Basin.parse(typeId)
        if (! basinType) {
            console.log(point);

            return false
        }
        const isDivide = this.#directionBitmask.get(point).length === 1
        return basinType.hasRivers && isDivide
    }

    getText(point) {
        const basin = this.get(point)
        const attrs = [
            `id=${basin.id}`,
            `type=${basin.type ? basin.type.name : ''}`,
            `erosion=${basin.erosion ? basin.erosion.name : 'NADA'}`,
            `distance=${basin.distance}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        const basin = this.get(tilePoint)
        let color
        if (this.#world.surface.isLand(tilePoint)) {
            color = basin ? basin.type.color : DiffuseLandBasin.color
        } else {
            color =  WaterBasin.color
        }
        canvas.rect(canvasPoint, tileSize, color.toHex())
        if (basin && params.get('showErosion')) {
            if (basin.erosion) {
                const text = basin.erosion.symbol
                const textColor = color.invert().toHex()
                canvas.text(canvasPoint, tileSize, text, textColor)
            } else {
                console.log(tilePoint);

            }
            this.#drawErosionLines(props, basin)
        }
    }

    #drawErosionLines(props, basin) {
        const {canvasPoint, tilePoint, tileSize} = props
        const color = basin.type.color.darken(30).toHex()
        const lineWidth = Math.round(props.tileSize / 20)
        // calc midpoint point on canvas
        const pixelsPerZonePoint = tileSize / this.#zoneRect.width
        const canvasMidpoint = Point.multiplyScalar(basin.midpoint, pixelsPerZonePoint)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)

        // draw line for each neighbor with a basin connection
        const directions = this.#directionBitmask.get(tilePoint)
        for(let direction of directions) {
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            const axisModifier = direction.axis.map(c => {
                if (c < 0) return 0
                if (c > 0) return tileSize
                return Math.floor(tileSize * .5)
            })
            const canvasEdgePoint = Point.plus(canvasPoint, axisModifier)
            props.canvas.line(canvasEdgePoint, meanderPoint, lineWidth, color)
        }
    }
}
