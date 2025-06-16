import { PointSet } from '/src/lib/geometry/point/set'
import { PointMap } from '/src/lib/geometry/point/map'
import { Point } from '/src/lib/geometry/point'

import { DirectionBitMaskGrid } from '/src/model/tilemap/lib/bitmask'

import { buildRiverMap } from './fill'
import { RiverStretch } from './data'


export class RiverLayer {
    #zoneRect
    // maps an id to a name
    #riverNames = new Map()
    // map a point to an id
    #riverPointGrid
    // map a point to a river direction mask
    #directionMaskGrid
    // map a river point to its river type
    #stretchMap

    #riverMouths

    constructor(context) {
        const {rect, world, zoneRect} = context
        this.#zoneRect = zoneRect
        this.world = world
        this.#directionMaskGrid = new DirectionBitMaskGrid(rect)
        this.#riverMouths = new PointSet(rect)
        this.#stretchMap = new PointMap(rect)
        const _context = {
            ...context,
            riverNames: this.#riverNames,
            riverMouths: this.#riverMouths,
            directionMaskGrid: this.#directionMaskGrid,
            stretchMap: this.#stretchMap,
        }
        this.#riverPointGrid = buildRiverMap(_context)
    }

    get count() {
        return this.#riverNames.size
    }

    has(point) {
        return this.#riverPointGrid.get(point) !== null
    }

    get(point) {
        const id = this.#riverPointGrid.get(point)
        const stretchId = this.#stretchMap.get(point)
        return {
            id,
            flows: this.world.basin.getFlows(point),
            name: this.#riverNames.get(id),
            mouth: this.#riverMouths.has(point),
            stretch: RiverStretch.get(stretchId),
        }
    }

    isMouth(point) {
        return this.#riverMouths.has(point)
    }

    is(point, type) {
        if (this.#riverPointGrid.get(point) == null) {
            return false
        }
        const river = this.get(point)
        return river.stretch.id == type.id
    }

    getText(point) {
        if (this.#riverPointGrid.get(point) == null)
            return ''
        const river = this.get(point)
        const attrs = [
             `${river.id}`,
             `${river.name}${river.mouth ? ' mouth' : ''}`,
             `stretch=${river.stretch.name}`,
        ].filter(x=>x).join(',')
        return `River(${attrs})`
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        props.world.biome.draw(props, params)
        if (! this.has(tilePoint)) {
            return
        }
        const river = this.get(tilePoint)
        const riverWidth = Math.round(river.stretch.width * tileSize)
        const midSize = Math.round(tileSize / 2)
        const offset = Math.round(tileSize / 10)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const meander = this.world.basin.getMidpoint(tilePoint)
        const meanderOffsetPoint = Point.multiplyScalar(meander, tileSize / this.#zoneRect.width)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const hexColor = river.stretch.color.toHex()
        // for each neighbor with a river connection
        for(let direction of river.flows) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + direction.axis[0] * midSize,
                midCanvasPoint[1] + direction.axis[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, riverWidth, hexColor)
        }
    }
}
