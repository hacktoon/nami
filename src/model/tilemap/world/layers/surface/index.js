import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import {
    Surface,
    OceanSurface,
    SeaSurface,
    IslandSurface,
    ContinentSurface
} from './data'
import { SurfaceChunk } from './chunk'


// use 0 and 1 as "empty" values
const EMPTY_BODY = 0
const EMPTY_WATERBODY = 1
// this is the first value considered "filled"
const FIRST_BODY_ID = 2

// Area ratios
const SURFACE_RATIO = .6
const MINIMUN_OCEAN_RATIO = 4
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

    #bodyIdCount = FIRST_BODY_ID

    landBorders = []

    constructor(rect, layers) {
        this.#detectSurfaceBodies(rect, layers)
        this.#detectSurfaceType()
        this.#detectBorderTypes()
    }

    #detectSurfaceBodies(rect, layers) {
        // init points as land/water according to noise map
        this.#bodyMatrix = Matrix.fromRect(rect, point => {
            // detect water points with "outline" noise map
            const isWaterBody = layers.noise.getOutline(point) < SURFACE_RATIO
            return isWaterBody ? EMPTY_WATERBODY : EMPTY_BODY
        })
    }

    #detectSurfaceType() {
        // flood fill "empty" points and determine body type by total area
        this.#bodyMatrix.forEach(originPoint => {
            if (! this.#isEmptyBody(originPoint)) return
            const isEmptyWaterBody = this.#isEmptyWaterBody(originPoint)
            const area = this.#fillBodyArea(originPoint, this.#bodyIdCount)
            const surfaceAreaRatio = (area * 100) / this.#bodyMatrix.area
            // set continent as default type
            let type = ContinentSurface
            // area is filled; decide type
            if (isEmptyWaterBody) {
                if (surfaceAreaRatio >= MINIMUN_OCEAN_RATIO)
                    type = OceanSurface
                else if (surfaceAreaRatio >= MINIMUN_SEA_RATIO)
                    type = SeaSurface
            } else if (surfaceAreaRatio < MINIMUN_CONTINENT_RATIO) {
                type = IslandSurface
            }
            this.#bodyTypeMap.set(this.#bodyIdCount, type.id)
            this.#bodyAreaMap.set(this.#bodyIdCount, area)
            this.#bodyIdCount++
        })
    }

    #isEmptyBody(point) {
        const bodyId = this.#bodyMatrix.get(point)
        return bodyId === EMPTY_BODY || bodyId === EMPTY_WATERBODY
    }

    #isEmptyWaterBody(point) {
        return this.#bodyMatrix.get(point) === EMPTY_WATERBODY
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
            this.#bodyMatrix.set(point, bodyId)
            area++
        }
        const wrapPoint = point => this.#bodyMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    #detectBorderTypes() {
        // surface body matrix already defined, update it by setting
        // water/land borders as negative ids
        this.#bodyMatrix.forEach(point => {
            const isWater = this.isWater(point)
            const bodyId = this.#bodyMatrix.get(point)
            if (this.#isBorder(point, isWater)) {
                // negative bodyId's are surface borders
                this.#bodyMatrix.set(point, -bodyId)
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
        const bodyId = Math.abs(this.#bodyMatrix.get(point))
        return Surface.parse(this.#bodyTypeMap.get(bodyId))
    }

    getChunk(params) {
        return new SurfaceChunk(params)
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
        const bodyId = Math.abs(this.#bodyMatrix.get(point))
        const area = (this.#bodyAreaMap.get(bodyId) * 100) / this.#bodyMatrix.area
        return area.toFixed(1)
    }

    getWaterArea() {
        const area = (this.#waterArea * 100) / this.#bodyMatrix.area
        return area.toFixed(1)
    }

    is(point, type) {
        const surface = this.get(point)
        return surface.id === type.id
    }

    isWater(point) {
        return this.get(point).water
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isContinent(point) {
        const surface = this.get(point)
        return surface.id == ContinentSurface.id
    }

    isIsland(point) {
        const surface = this.get(point)
        return surface.id == IslandSurface.id
    }

    isSea(point) {
        const surface = this.get(point)
        return surface.id == SeaSurface.id
    }

    isBorder(point) {
        // negative bodyId's are surface borders
        return this.#bodyMatrix.get(point) < 0
    }
}
