import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { Surface } from './data'


const EMPTY_BODY = 0
const EMPTY_WATERBODY = 1
const FIRST_BODY_ID = 2

// Area ratios
const SURFACE_RATIO = .55
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .2
const MINIMUN_CONTINENT_RATIO = 1


// Major world bodies with surface area and type
export class SurfaceLayer {
    // stores surface body id for each point
    #bodyMatrix
    // maps a body id to its surface type
    #bodyTypeMap = new Map()
    // maps a body id to its surface area
    #bodyAreaMap = new Map()
    #waterArea = 0

    constructor(rect, layers) {
        this.#bodyMatrix = Matrix.fromRect(rect, point => {
            // detect water points with "outline" noise map
            const isWaterBody = SURFACE_RATIO >= layers.noise.getOutline(point)
            return isWaterBody ? EMPTY_WATERBODY : EMPTY_BODY
        })

        // detect surface body id and area
        let bodyId = FIRST_BODY_ID
        this.#bodyMatrix.forEach(point => {
            // start a fill for each empty point in matrix
            if (!this.#isEmptyBody(point)) return
            const body = this.#buildSurfaceBody(point, bodyId)
            this.#bodyTypeMap.set(bodyId, body.type.id)
            this.#bodyAreaMap.set(bodyId, body.area)
            bodyId++
        })

        // surface body matrix already defined, update it by setting
        // water/land borders as negative ids
        this.landBorders = []
        this.#bodyMatrix.forEach(point => {
            const isWater = this.isWater(point)
            const bodyId = this.#bodyMatrix.get(point)
            if (this.#detectBorder(point, isWater)) {
                // negative bodyId's are surface borders
                this.#bodyMatrix.set(point, -bodyId)
                // store land borders for other layers to use
                if (!isWater) this.landBorders.push(point)
            }
            if (isWater) this.#waterArea++
        })
    }

    #detectBorder(point, isWater) {
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.isWater(sidePoint)
            if (isWater && ! isSideWater || ! isWater && isSideWater) {
                return true
            }
        }
        return false
    }

    #isEmptyBody(point) {
        const bodyId = this.#bodyMatrix.get(point)
        return bodyId === EMPTY_BODY || bodyId === EMPTY_WATERBODY
    }

    #isEmptyWaterBody(point) {
        return this.#bodyMatrix.get(point) === EMPTY_WATERBODY
    }

    #buildSurfaceBody(originPoint, bodyId) {
        const isEmptyWaterBody = this.#isEmptyWaterBody(originPoint)
        const area = this.#fillSurface(originPoint, bodyId)
        const surfaceAreaRatio = (area * 100) / this.#bodyMatrix.area
        // default type
        let type = Surface.CONTINENT
        // area is filled; decide type
        if (isEmptyWaterBody) {
            if (surfaceAreaRatio >= MINIMUN_OCEAN_RATIO)
                type = Surface.OCEAN
            else if (surfaceAreaRatio >= MINIMUN_SEA_RATIO)
                type = Surface.SEA
        } else if (surfaceAreaRatio < MINIMUN_CONTINENT_RATIO) {
            type = Surface.ISLAND
        }

        return {type, area}
    }

    #fillSurface(originPoint, bodyId) {
        // discover all points of same type ( water | land )
        let area = 0
        const isOriginWater = this.#isEmptyWaterBody(originPoint)
        const canFill = targetPoint => {
            const isTargetWater = this.#isEmptyWaterBody(targetPoint)
            const isSameMaterial = isOriginWater === isTargetWater
            return this.#isEmptyBody(targetPoint) && isSameMaterial
        }
        const onFill = point => {
            this.#bodyMatrix.set(point, bodyId)
            area++
        }
        const wrapPoint = point => this.#bodyMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    get(point) {
        // negative bodyId's are surface borders
        const bodyId = Math.abs(this.#bodyMatrix.get(point))
        return Surface.get(this.#bodyTypeMap.get(bodyId))
    }

    getColor(point, showBorders) {
        const surface = this.get(point)
        if (showBorders && this.isBorder(point)) {
            return surface.water ? Color.BLUE : Color.GREEN
        }
        return surface.color
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        const type = surface.water ? 'W' : 'L'
        return `Surface(${surface.name}(${type}), area=${surfaceArea}%)`
    }

    getArea(point) {
        const bodyId = Math.abs(this.#bodyMatrix.get(point))
        const area = (this.#bodyAreaMap.get(bodyId) * 100) / this.#bodyMatrix.area
        return area.toFixed(1)
    }

    getWaterArea() {
        const area = (this.#waterArea * 100) / this.#bodyMatrix.area
        return area.toFixed(1)
    }

    is(point, type) {
        const id = this.#bodyTypeMap.get(point)
        return id === type.id
    }

    isWater(point) {
        return this.get(point).water
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isBorder(point) {
        // negative bodyId's are surface borders
        return this.#bodyMatrix.get(point) < 0
    }
}
