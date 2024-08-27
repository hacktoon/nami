import { Point } from '/src/lib/point'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'
import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'

import { buildBasinGrid } from './fill'
import { Basin, EMPTY } from './data'


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
    #erosionGridMask

    // Float used to connect with adjacent tiles
    #jointGrid

    // map a point to a point index in a zone rect
    #midpointIndexGrid

    constructor(rect, layers, zoneRect) {
        this.#zoneRect = zoneRect
        this.#distanceGrid = Grid.fromRect(rect, () => 0)
        this.#erosionGrid = Grid.fromRect(rect, () => null)
        this.#jointGrid = Grid.fromRect(rect, () => 0)
        this.#midpointIndexGrid = Grid.fromRect(rect, () => null)
        this.#erosionGridMask = new DirectionMaskGrid(rect)
        const context = {
            rect,
            layers,
            typeMap: this.#typeMap,
            zoneRect: this.#zoneRect,
            jointGrid: this.#jointGrid,
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
        const typeId = this.#typeMap.get(id) ?? Basin.id
        return {
            id,
            type: Basin.parse(typeId),
            distance: this.getDistance(point),
            erosion: this.getErosion(point),
            midpoint: this.getMidpoint(point),
            joint: this.getJoint(point)
        }
    }

    getZone(point) {
        // reads the wire data and create points for zone grid
        const pointDirectionMap = new PointMap(this.#zoneRect)
        const midpoint = this.getMidpoint(point)
        const midSize = Math.floor(this.#zoneRect.width / 2)
        let [mx, my] = midpoint
        for(let axis of this.#erosionGridMask.getAxis(point)) {
            const tx = midSize + (midSize * axis[0])
            const ty = midSize + (midSize * axis[1])
            let [x, y] = [tx, ty]
            while(Point.differs([x, y], midpoint)) {
                pointDirectionMap.add([x, y])
                if (Random.chance(.5)) {
                    if (x > mx) {
                        x--
                    } else if (x < mx) {
                        x++
                    }
                } else {
                    if (y < my) {
                        y++
                    } else if (y > my) {
                        y--
                    }
                }
            }
        }
        pointDirectionMap.add(midpoint)
        return pointDirectionMap
    }

    getJoint(point) {
        return this.#jointGrid.get(point)
    }

    getMidpoint(point) {
        const index = this.#midpointIndexGrid.get(point)
        return this.#zoneRect.indexToPoint(index)
    }

    getColor(point) {
        if (! this.has(point)) return Basin.color
        return this.get(point).type.color
    }

    getFlows(point) {
        return this.#erosionGridMask.get(point)
    }

    getErosionPathAxis(point) {
        return this.#erosionGridMask.getAxis(point)
    }

    isDivide(point) {
        return this.#erosionGridMask.get(point).length === 1
    }

    getErosion(point) {
        const directionId = this.#erosionGrid.get(point)
        return Direction.fromId(directionId)
    }

    getDistance(point) {
        return this.#distanceGrid.get(point)
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

    drawErosion(point, props, baseColor) {
        const directions = this.#erosionGridMask.getAxis(point)
        const color = baseColor.darken(20).toHex()
        const lineWidth = Math.round(props.tileSize / 8)
        const _props = {...props, color, lineWidth, directions}
        this.#drawDirectionGrid(point, _props)
    }

    #drawDirectionGrid(point, props) {
        const {canvas, canvasPoint, tileSize, color, lineWidth} = props
        const midSize = Math.round(tileSize / 2)
        const canvasCenterPoint = Point.plusScalar(canvasPoint, midSize)
        // calc midpoint point on canvas
        const midpoint = this.getMidpoint(point)
        const canvasMidpoint = Point.multiplyScalar(midpoint, tileSize / this.#zoneRect.width)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)

        // draw line for each neighbor with a basin connection
        for(let directionAxis of props.directions) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                canvasCenterPoint[0] + directionAxis[0] * midSize,
                canvasCenterPoint[1] + directionAxis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, lineWidth, color)
        }
    }
}
