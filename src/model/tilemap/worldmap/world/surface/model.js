import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import {
    Surface,
    OceanSurface,
    SeaSurface,
    ContinentSurface,
    IslandSurface,
    LakeSurface,
} from './type'


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


export function buildSurfaceGrid(baseContext) {
    const {rect, world} = baseContext
    // maps a body id to its surface area
    const context = {
        ...baseContext,
        bodyId: FIRST_BODY_ID,
        bodyTypeMap: new Map(),
        bodyAreaMap: new Map(),
    }
    // detect land or water tiles in the grid
    const grid = detectLandWater(rect, world)
    // detect surface type by filling empty bodies
    const waterArea = detectSurfaceAreas(context, grid)
    // // detect borders and set them as negative ids
    detectBorders(context, grid)
    return {
        grid,
        waterArea,
        bodyTypeMap: context.bodyTypeMap,
        bodyAreaMap: context.bodyAreaMap,
    }
}


function detectLandWater(rect, world) {
    // init points as land/water according to noise map
    return Grid.fromRect(rect, point => {
        const noise = world.noise.get4D(rect, point, "outline")
        const isWaterBody = noise < SURFACE_RATIO
        return isWaterBody ? EMPTY_WATERBODY : EMPTY_LANDBODY
    })
}


function detectSurfaceAreas(context, grid) {
    let waterArea = 0
    // flood fill "empty" points and determine body type by total area
    grid.forEach(originPoint => {
        if (! isEmptyBody(grid, originPoint)) return
        // detect empty type before filling
        const emptyWaterBody = isEmptyWaterBody(grid, originPoint)
        const area = fillBodyArea(context, grid, originPoint)
        const surfaceAreaRatio = (area * 100) / grid.area
        // set continent as default type
        let type = ContinentSurface
        // area is filled; decide type
        if (emptyWaterBody) {
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
        context.bodyTypeMap.set(context.bodyId, type.id)
        context.bodyAreaMap.set(context.bodyId, area)
        context.bodyId++
        // update world water area
        waterArea += type.isWater ? area : 0
    })
    return waterArea
}


function detectBorders(context, grid) {
    // surface body matrix already defined, update it by setting
    // water/land borders as negative ids
    grid.forEach(point => {
        const isWater = isSurfaceWater(context, grid, point)
        const bodyId = grid.get(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = isSurfaceWater(context, grid, sidePoint)
            if (isWater && ! isSideWater || ! isWater && isSideWater) {
                // negative bodyId's are surface borders
                grid.set(point, -bodyId)
            }
        }
    })
}


function isEmptyBody(grid, point) {
    const bodyId = grid.get(point)
    return bodyId === EMPTY_LANDBODY || bodyId === EMPTY_WATERBODY
}


function isEmptyWaterBody(grid, point) {
    return grid.get(point) === EMPTY_WATERBODY
}


function fillBodyArea(context, grid, originPoint) {
    // discover all points of same type ( water | land )
    let area = 0
    const isOriginWater = isEmptyWaterBody(grid, originPoint)
    const canFill = targetPoint => {
        const isTargetWater = isEmptyWaterBody(grid, targetPoint)
        const isSameMaterial = isOriginWater === isTargetWater
        return isEmptyBody(grid, targetPoint) && isSameMaterial
    }
    const onFill = point => {
        grid.set(point, context.bodyId)
        area++
    }
    const wrapPoint = point => grid.wrap(point)
    // belowRation is water; search all sidepoints (water fills)
    const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
    new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
    return area
}



function isSurfaceWater(context, grid, point) {
    // negative bodyId's are surface borders
    const bodyId = Math.abs(grid.get(point))
    const surface = Surface.parse(context.bodyTypeMap.get(bodyId))
    return surface.isWater
}