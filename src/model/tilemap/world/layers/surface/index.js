import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { clamp } from '/src/lib/number'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import {
    Surface,
    WaterSurface,
    LandSurface
} from './data'
import { SurfaceChunk } from './chunk'


// use 0 and 1 as "empty" values
const EMPTY_LANDBODY = 0
const EMPTY_WATERBODY = 1
// this is the first value considered "filled"
const FIRST_BODY_ID = 2
// Area ratios
const SURFACE_RATIO = .6


// Major world bodies with surface area and type
export class SurfaceLayer {
    // stores surface body id for each point
    #matrix
    // maps a body id to its surface type
    #bodyTypeMap = new Map()
    // maps a body id to its surface area
    #bodyAreaMap = new Map()
    #waterArea = 0

    #bodyIdCount = FIRST_BODY_ID

    landBorders = []

    constructor(rect, layers) {
        this.#detectSurfaceBodies(rect, layers)
        this.#detectSurfaceType()
        this.#detectBorders()
    }

    #detectSurfaceBodies(rect, layers) {
        // init points as land/water according to noise map
        this.#matrix = Matrix.fromRect(rect, point => {
            const noise = layers.noise.get2D(point, "outline")
            const isWaterBody = noise < SURFACE_RATIO
            return isWaterBody ? EMPTY_WATERBODY : EMPTY_LANDBODY
        })
    }

    #detectSurfaceType() {
        // flood fill "empty" points and determine body type by total area
        this.#matrix.forEach(originPoint => {
            if (! this.#isEmptyBody(originPoint)) return
            const isWaterBody = this.#isEmptyWaterBody(originPoint)
            const area = this.#fillBodyArea(originPoint, this.#bodyIdCount)
            const type = isWaterBody && area > 3 ? WaterSurface : LandSurface
            this.#bodyTypeMap.set(this.#bodyIdCount, type.id)
            this.#bodyAreaMap.set(this.#bodyIdCount, area)
            this.#bodyIdCount++
        })
    }

    #isEmptyBody(point) {
        const bodyId = this.#matrix.get(point)
        return bodyId === EMPTY_LANDBODY || bodyId === EMPTY_WATERBODY
    }

    #isEmptyWaterBody(point) {
        return this.#matrix.get(point) === EMPTY_WATERBODY
    }

    #fillBodyArea(originPoint, bodyId) {
        // discover all points of same type ( water | land )
        let area = 0
        const isOriginWater = this.#isEmptyWaterBody(originPoint)
        const canFill = targetPoint => {
            const isTargetWater = this.#isEmptyWaterBody(targetPoint)
            const isSameMaterial = isOriginWater === isTargetWater
            return this.#isEmptyBody(targetPoint) && isSameMaterial
        }
        const onFill = point => {
            this.#matrix.set(point, bodyId)
            area++
        }
        const wrapPoint = point => this.#matrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    #detectBorders() {
        // surface body matrix already defined, update it by setting
        // water/land borders as negative ids
        this.#matrix.forEach(point => {
            const isWater = this.isWater(point)
            const bodyId = this.#matrix.get(point)
            if (this.#isBorder(point, isWater)) {
                // negative bodyId's are surface borders
                this.#matrix.set(point, -bodyId)
                // store borders for other layers to use
                if (!isWater) this.landBorders.push(point)
            }
            // update water tile area
            if (isWater) this.#waterArea++
        })
    }

    #isBorder(point, isWater) {
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.isWater(sidePoint)
            if (isWater && ! isSideWater || ! isWater && isSideWater) {
                return true
            }
        }
        return false
    }

    get(point) {
        // negative bodyId's are surface borders
        const bodyId = Math.abs(this.#matrix.get(point))
        return Surface.parse(this.#bodyTypeMap.get(bodyId))
    }

    getChunk(point, params) {
        return new SurfaceChunk(point, params)
    }

    getColor(point) {
        const color = this.get(point).color
        if (this.isBorder(point)) {
            return color.darken(40)
        }
        return color
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        const type = surface.water ? 'W' : 'L'
        return `Surface(${surface.name}(${type}), area=${surfaceArea}%)`
    }

    getArea(point) {
        const bodyId = Math.abs(this.#matrix.get(point))
        const area = (this.#bodyAreaMap.get(bodyId) * 100) / this.#matrix.area
        return area.toFixed(1)
    }

    getWaterArea() {
        const area = (this.#waterArea * 100) / this.#matrix.area
        return area.toFixed(1)
    }

    isWater(point) {
        return this.get(point).water
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isBorder(point) {
        // negative bodyId's are surface borders
        return this.#matrix.get(point) < 0
    }
}
