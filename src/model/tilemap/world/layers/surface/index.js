import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import {
    Surface,
    OceanSurface,
    SeaSurface,
    ContinentSurface,
    IslandSurface,
    LakeSurface
} from './data'


// use 0 and 1 as "empty" values
const EMPTY_LANDBODY = 0
const EMPTY_WATERBODY = 1
// this is the first value considered "filled"
const FIRST_BODY_ID = 2
// Area ratios
const SURFACE_RATIO = .6
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .05
const MINIMUN_CONTINENT_RATIO = 1


// Major world bodies with surface area and type
export class SurfaceLayer {
    // stores surface body id for each point
    #grid
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
        this.#grid = Grid.fromRect(rect, point => {
            const noise = layers.noise.get4D(rect, point, "outline")
            const isWaterBody = noise < SURFACE_RATIO
            return isWaterBody ? EMPTY_WATERBODY : EMPTY_LANDBODY
        })
    }

    #detectSurfaceType() {
        // flood fill "empty" points and determine body type by total area
        this.#grid.forEach(originPoint => {
            if (! this.#isEmptyBody(originPoint)) return
            // detect empty type before filling
            const isEmptyWaterBody = this.#isEmptyWaterBody(originPoint)
            const area = this.#fillBodyArea(originPoint, this.#bodyIdCount)
            const surfaceAreaRatio = (area * 100) / this.#grid.area
            // set continent as default type
            let type = ContinentSurface
            // area is filled; decide type
            if (isEmptyWaterBody) {
                if (surfaceAreaRatio >= MINIMUN_OCEAN_RATIO) {
                    type = OceanSurface
                } else if (surfaceAreaRatio >= MINIMUN_SEA_RATIO) {
                    type = SeaSurface
                } else {
                    type = LakeSurface
                }
            } else if (surfaceAreaRatio < MINIMUN_CONTINENT_RATIO) {
                type = IslandSurface
            }
            this.#bodyTypeMap.set(this.#bodyIdCount, type.id)
            this.#bodyAreaMap.set(this.#bodyIdCount, area)
            this.#bodyIdCount++
        })
    }

    #isEmptyBody(point) {
        const bodyId = this.#grid.get(point)
        return bodyId === EMPTY_LANDBODY || bodyId === EMPTY_WATERBODY
    }

    #isEmptyWaterBody(point) {
        return this.#grid.get(point) === EMPTY_WATERBODY
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
            this.#grid.set(point, bodyId)
            area++
        }
        const wrapPoint = point => this.#grid.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    #detectBorders() {
        // surface body matrix already defined, update it by setting
        // water/land borders as negative ids
        this.#grid.forEach(point => {
            const isWater = this.isWater(point)
            const bodyId = this.#grid.get(point)
            if (this.#isBorder(point, isWater)) {
                // negative bodyId's are surface borders
                this.#grid.set(point, -bodyId)
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
        const bodyId = Math.abs(this.#grid.get(point))
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
        return `Surface(${surface.name}(${type}), area=${surfaceArea})`
    }

    getArea(point) {
        const bodyId = Math.abs(this.#grid.get(point))
        return this.#bodyAreaMap.get(bodyId)
    }

    getWaterArea() {
        const area = (this.#waterArea * 100) / this.#grid.area
        return area.toFixed(1)
    }

    isWater(point) {
        return this.get(point).water
    }

    isLake(point) {
        return this.get(point).id == LakeSurface.id
    }

    isOcean(point) {
        return this.get(point).id == OceanSurface.id
    }

    isSea(point) {
        return this.get(point).id == SeaSurface.id
    }

    isIsland(point) {
        return this.get(point).id == IslandSurface.id
    }

    isContinent(point) {
        return this.get(point).id == ContinentSurface.id
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isBorder(point) {
        // negative bodyId's are surface borders
        return this.#grid.get(point) < 0
    }
}
