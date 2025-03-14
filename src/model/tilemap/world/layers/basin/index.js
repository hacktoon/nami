import { Point } from '/src/lib/geometry/point'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/geometry/point/map'
import { Direction } from '/src/lib/direction'
import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'

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

    // map a point to a basin zone paths
    #erosionGridMask

    // map a point to a point index in a zone rect
    #midpointIndexGrid

    constructor(rect, layers, zoneRect) {
        this.#layers = layers
        this.#zoneRect = zoneRect
        this.#distanceGrid = Grid.fromRect(rect, () => 0)
        this.#erosionGrid = Grid.fromRect(rect, () => null)
        this.#midpointIndexGrid = Grid.fromRect(rect, () => null)
        this.#erosionGridMask = new DirectionMaskGrid(rect)
        const context = {
            rect,
            layers,
            typeMap: this.#typeMap,
            zoneRect: this.#zoneRect,
            erosionGrid: this.#erosionGrid,
            distanceGrid: this.#distanceGrid,
            erosionGridMask: this.#erosionGridMask,
            midpointIndexGrid: this.#midpointIndexGrid,
        }
        this.#basinGrid = buildBasinGrid(context)
    }

    has(point) {
        return this.#basinGrid.get(point) != EMPTY
    }

    get(point) {
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
            `joint=${basin.joint}`,
        ].join(',')
        return `Basin(${attrs})`
    }

    draw(props, params) {
        let color = OceanicBasin.color
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        if (this.has(tilePoint)) {
            color = this.get(tilePoint).type.color
        }
        canvas.rect(canvasPoint, tileSize, color.toHex())
        if (this.has(tilePoint) && params.get('showErosion')) {
            const basin = this.get(tilePoint)
            const text = basin.erosion.symbol
            const textColor = color.invert().toHex()
            const joint = this.#layers.topology.getJoint(tilePoint)
            canvas.text(canvasPoint, tileSize, text, textColor)
            // canvas.text(canvasPoint, tileSize/5, joint.toFixed(2), '#000')
            const _props = {
                ...props,
                zoneRect: this.#zoneRect,
                joint,
                midpoint: this.getMidpoint(tilePoint),
                color: color.darken(30).toHex(),
                lineWidth: Math.round(props.tileSize / 20),
                directions: this.#erosionGridMask.get(tilePoint),
            }
            this.#drawErosionLines(tilePoint, _props)
        }
    }

    #drawErosionLines(point, props) {
        const {canvasPoint, tileSize, color, lineWidth} = props
        // calc midpoint point on canvas
        const pixelsPerZonePoint = tileSize / props.zoneRect.width
        const canvasMidpoint = Point.multiplyScalar(props.midpoint, pixelsPerZonePoint)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)
        // draw line for each neighbor with a basin connection
        for(let direction of props.directions) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const sidePoint = Point.atDirection(point, direction)
            // get average between this point and neighbor
            const sideJoint = this.#layers.topology.getJoint(sidePoint)
            const avgJoint = (props.joint + sideJoint) / 2
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
