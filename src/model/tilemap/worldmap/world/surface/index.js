import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import {
    Surface,
    OceanSurface,
    SeaSurface,
    ContinentSurface,
    IslandSurface,
    LakeSurface
} from './type'

import { ZoneSurface } from './zone'


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

    constructor(context) {
        const {rect, world} = context
        const grid = this.#detectSurfaceBodies(rect, world)
        this.#detectSurfaceType(grid)
        this.#detectBorders(grid)
        this.#grid = grid
    }

    #detectSurfaceBodies(rect, world) {
        // init points as land/water according to noise map
        return Grid.fromRect(rect, point => {
            const noise = world.noise.get4D(rect, point, "outline")
            const isWaterBody = noise < SURFACE_RATIO
            return isWaterBody ? EMPTY_WATERBODY : EMPTY_LANDBODY
        })
    }

    #detectSurfaceType(grid) {
        // flood fill "empty" points and determine body type by total area
        grid.forEach(originPoint => {
            if (! this.#isEmptyBody(grid, originPoint)) return
            // detect empty type before filling
            const isEmptyWaterBody = this.#isEmptyWaterBody(grid, originPoint)
            const area = this.#fillBodyArea(grid, originPoint, this.#bodyIdCount)
            const surfaceAreaRatio = (area * 100) / grid.area
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

    #isEmptyBody(grid, point) {
        const bodyId = grid.get(point)
        return bodyId === EMPTY_LANDBODY || bodyId === EMPTY_WATERBODY
    }

    #isEmptyWaterBody(grid, point) {
        return grid.get(point) === EMPTY_WATERBODY
    }

    #fillBodyArea(grid, originPoint, bodyId) {
        // discover all points of same type ( water | land )
        let area = 0
        const isOriginWater = this.#isEmptyWaterBody(grid, originPoint)
        const canFill = targetPoint => {
            const isTargetWater = this.#isEmptyWaterBody(grid, targetPoint)
            const isSameMaterial = isOriginWater === isTargetWater
            return this.#isEmptyBody(grid, targetPoint) && isSameMaterial
        }
        const onFill = point => {
            grid.set(point, bodyId)
            area++
        }
        const wrapPoint = point => grid.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return area
    }

    #detectBorders(grid) {
        // surface body matrix already defined, update it by setting
        // water/land borders as negative ids
        grid.forEach(point => {
            const isWater = this.#get(grid, point).water
            const bodyId = grid.get(point)
            if (this.#isBorder(grid, point, isWater)) {
                // negative bodyId's are surface borders
                grid.set(point, -bodyId)
            }
            // update water tile area
            if (isWater) this.#waterArea++
        })
    }

    #isBorder(grid, point, isWater) {
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#get(grid, sidePoint).water
            if (isWater && ! isSideWater || ! isWater && isSideWater) {
                return true
            }
        }
        return false
    }

    #get(grid, point) {
        // negative bodyId's are surface borders
        const bodyId = Math.abs(grid.get(point))
        return Surface.parse(this.#bodyTypeMap.get(bodyId))
    }

    get(point) {
        // negative bodyId's are surface borders
        const bodyId = Math.abs(this.#grid.get(point))
        return Surface.parse(this.#bodyTypeMap.get(bodyId))
    }

    getZone(point, params) {
        return new ZoneSurface(point, params)
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

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        if (this.isBorder(tilePoint)) {
            color = color.darken(20)
        }
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
