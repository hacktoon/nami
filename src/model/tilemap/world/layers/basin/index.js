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
        window.Random = Random
        this.#zoneRect = zoneRect
        this.#distanceGrid = Grid.fromRect(rect, () => 0)
        this.#erosionGrid = Grid.fromRect(rect, () => null)
        this.#jointGrid = Grid.fromRect(rect, () => Random.floatRange(.2, .8))
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
        const typeId = this.#typeMap.get(id) ?? Basin.id
        const directionId = this.#erosionGrid.get(point)
        return {
            id,
            type: Basin.parse(typeId),
            distance: this.#distanceGrid.get(point),
            erosion: Direction.fromId(directionId),
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
        for(let direction of this.#erosionGridMask.get(point)) {
            const tx = midSize + midSize * direction.axis[0]
            const ty = midSize + midSize * direction.axis[1]
            let [x, y] = [tx, ty]
            while(Point.differs([x, y], midpoint)) {
                pointDirectionMap.set([x, y])
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
        return this.get(point).type.color
    }

    getFlows(point) {
        return this.#erosionGridMask.get(point)
    }

    isDivide(point) {
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

    drawErosion(point, props, baseColor) {
        const _props = {
            ...props,
            zoneRect: this.#zoneRect,
            joint: this.getJoint(point),
            midpoint: this.getMidpoint(point),
            color: baseColor.darken(20).toHex(),
            lineWidth: Math.round(props.tileSize / 20),
            directions: this.#erosionGridMask.get(point),
        }
        this.#drawDirectionGrid(point, _props)
    }

    #drawDirectionGrid(point, props) {
        const {
            canvasPoint, tileSize, color, lineWidth
        } = props
        // calc midpoint point on canvas
        const pixelsPerZonePoint = tileSize / props.zoneRect.width
        const canvasMidpoint = Point.multiplyScalar(props.midpoint, pixelsPerZonePoint)
        const meanderPoint = Point.plus(canvasPoint, canvasMidpoint)
        // draw line for each neighbor with a basin connection
        const lines = []
        for(let direction of props.directions) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const sidePoint = Point.atDirection(point, direction)
            // get average between this point and neighbor
            const sideJoint = this.getJoint(sidePoint)
            const avgJoint = (props.joint + sideJoint) / 2
            // map each axis coordinate to random value in zone's rect edge
            // summing values from origin [0, 0] bottom-right oriented
            const axisModifier = direction.axis.map(c => {
                if (c < 0) return 0
                if (c > 0) return tileSize
                return Math.floor(tileSize * avgJoint)
            })
            const canvasEdgePoint = Point.plus(canvasPoint, axisModifier)
            lines.push([canvasEdgePoint, meanderPoint, lineWidth, color])

        }
        for(let line of lines) {
            props.canvas.line(...line)
        }
    }
}
