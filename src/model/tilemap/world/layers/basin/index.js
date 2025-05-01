import { Point } from '/src/lib/geometry/point'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { DirectionBitMaskGrid } from '/src/model/tilemap/lib/bitmask'

import { buildBasinGrid } from './fill'
import { Basin, EMPTY, OceanicBasin } from './data'


export class BasinLayer {
    #layers
    #zoneRect

    // grid of basin ids
    #basinGrid

    // the walk distance of each basin starting from shore
    // initial value is 0, used to determine river stretch
    #distanceGrid

    // grid of direction ids
    #erosionGrid

    // map basin type for creating rivers or other features
    #typeMap = new Map()

    // map a point to a basin zone direction bitmask
    #erosionGridMask

    // map a point to a point index in a zone rect
    #midpointIndexGrid

    constructor(context) {
        const {rect, layers, zoneRect} = context
        this.#layers = layers
        this.#zoneRect = zoneRect
        this.#distanceGrid = Grid.fromRect(rect, () => 0)
        this.#erosionGrid = Grid.fromRect(rect, () => null)
        this.#midpointIndexGrid = Grid.fromRect(rect, () => null)
        this.#erosionGridMask = new DirectionBitMaskGrid(rect)
        const _context = {
            ...context,
            typeMap: this.#typeMap,
            erosionGrid: this.#erosionGrid,
            distanceGrid: this.#distanceGrid,
            erosionGridMask: this.#erosionGridMask,
            midpointIndexGrid: this.#midpointIndexGrid,
        }
        this.#basinGrid = buildBasinGrid(_context)
    }

    has(point) {
        return this.#basinGrid.get(point) != EMPTY
    }

    get(point) {
        if (! this.has(point)) return null
        const id = this.#basinGrid.get(point)
        const typeId = this.#typeMap.get(id)
        const directionId = this.#erosionGrid.get(point)
        return {
            id,
            type: Basin.parse(typeId),
            distance: this.#distanceGrid.get(point),
            erosion: Direction.fromId(directionId),
            midpoint: this.getMidpoint(point),
        }
    }

    getMidpoint(point) {
        const index = this.#midpointIndexGrid.get(point)
        return this.#zoneRect.indexToPoint(index)
    }

    getFlows(point) {
        return this.#erosionGridMask.get(point)
    }

    isDivide(point) {
        if (! this.has(point)) return false
        return this.#erosionGridMask.get(point).length === 1
    }

    getText(point) {
        if (! this.has(point)) return ''
        const basin = this.get(point)
        const attrs = [
            `id=${basin.id}`,
            `type=${basin.type ? basin.type.name : ''}`,
            `erosion=${basin.erosion.name}`,
            `distance=${basin.distance}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        const basin = this.get(tilePoint)
        let color = basin ? basin.type.color : OceanicBasin.color
        canvas.rect(canvasPoint, tileSize, color.toHex())
        if (basin && params.get('showErosion')) {
            const text = basin.erosion.symbol
            const textColor = color.invert().toHex()
            canvas.text(canvasPoint, tileSize, text, textColor)
            // canvas.text(canvasPoint, tileSize/5, joint.toFixed(2), '#000')
            this.#drawErosionLines(props, basin)
        }
    }

    #drawErosionLines(props, basin) {
        const {canvasPoint, tilePoint, tileSize} = props
        const color = basin.type.color.darken(30).toHex()
        const lineWidth = Math.round(props.tileSize / 20)
        // calc midpoint point on canvas
        const pixelsPerZonePoint = tileSize / this.#zoneRect.width
        const midpoint = this.getMidpoint(tilePoint)
        const canvasMidpoint = Point.multiplyScalar(midpoint, pixelsPerZonePoint)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)
        const joint = this.#layers.topology.getJoint(tilePoint)
        // draw line for each neighbor with a basin connection
        const directions = this.#erosionGridMask.get(tilePoint)
        for(let direction of directions) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const sidePoint = Point.atDirection(tilePoint, direction)
            // get average between this point and neighbor
            const sideJoint = this.#layers.topology.getJoint(sidePoint)
            const avgJoint = (joint + sideJoint) / 2
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            const axisModifier = direction.axis.map(c => {
                if (c < 0) return 0
                if (c > 0) return tileSize
                return Math.floor(tileSize * avgJoint)
            })
            const canvasEdgePoint = Point.plus(canvasPoint, axisModifier)
            props.canvas.line(canvasEdgePoint, meanderPoint, lineWidth, color)
        }
    }
}
