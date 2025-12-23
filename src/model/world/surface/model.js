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


const EMPTY = null
const LAND = 0
const WATER = 1
// Area ratios
const SURFACE_RATIO = .6
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .05
const MINIMUN_CONTINENT_RATIO = 1


export function buildSurfaceModel(context) {
    const {rect, world} = context
    // detect land or water tiles in the grid
    const landWaterGrid = detectLandWater(rect, world)
    // detect surface type by filling empty bodies
    const {bodyGrid, bodyTypeMap, bodyAreaMap} = detectSurfaceAreas(context, landWaterGrid)
    const borderGrid = detectBorders(context, landWaterGrid)
    const waterArea = readWaterArea(bodyTypeMap, bodyAreaMap)
    return {
        border: borderGrid,
        body: bodyGrid,
        bodyType: bodyTypeMap,
        bodyArea: bodyAreaMap,
        waterArea,
    }
}


function detectLandWater(rect, world) {
    // init points as land/water according to noise map
    return Grid.fromRect(rect, point => {
        const noise = world.noise.get4DOutline(rect, point)
        return noise < SURFACE_RATIO ? WATER : LAND
    })
}


function detectSurfaceAreas(baseContext, landWaterGrid) {
    // flood fill "empty" points and determine body type by total area
    let bodyId = 1
    const bodyTypeMap = new Map()
    const bodyAreaMap = new Map()
    const bodyGrid = Grid.fromRect(baseContext.rect, () => EMPTY)
    const context = {...baseContext, bodyTypeMap, bodyGrid, landWaterGrid}

    landWaterGrid.forEach(originPoint => {
        if(bodyGrid.get(originPoint) != EMPTY) return
        // detect empty type before filling
        const emptyWaterBody = landWaterGrid.get(originPoint) === WATER
        const area = fillBodyArea(context, originPoint, bodyId)
        const surfaceAreaRatio = (area * 100) / landWaterGrid.area
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
        bodyTypeMap.set(bodyId, type.id)
        bodyAreaMap.set(bodyId, area)
        bodyId++
    })
    return {bodyGrid, bodyTypeMap, bodyAreaMap}
}

function fillBodyArea(context, originPoint, bodyId) {
    // discover all points of same type ( water | land )
    let area = 0
    const {rect, landWaterGrid, bodyGrid} = context
    const isOriginWater = landWaterGrid.get(originPoint) === WATER
    const canFill = targetPoint => {
        const isEmpty = bodyGrid.get(targetPoint) === EMPTY
        const isTargetWater = landWaterGrid.get(targetPoint) === WATER
        return isEmpty && isOriginWater === isTargetWater
    }
    const onFill = point => {
        bodyGrid.set(point, bodyId)
        area++
    }
    const wrapPoint = point => rect.wrap(point)
    // belowRation is water; search all sidepoints (water fills)
    const Fill = isOriginWater ? ScanlineFill8 : ScanlineFill
    new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
    return area
}


function detectBorders(context, landWaterGrid) {
    // surface body matrix already defined, update it by setting
    // water/land borders as negative ids
    const borderGrid = Grid.fromRect(context.rect, point => {
        const isWater = landWaterGrid.get(point) == WATER
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = landWaterGrid.get(sidePoint) == WATER
            if (isWater && ! isSideWater || ! isWater && isSideWater) {
                return 1
            }
        }
        return 0
    })
    return borderGrid
}


function readWaterArea(bodyTypeMap, bodyAreaMap) {
    let waterArea = 0
    bodyAreaMap.forEach((area, bodyId) => {
        // update world water area
        const type = Surface.parse(bodyTypeMap.get(bodyId))
        waterArea += type.isWater ? area : 0
    })
    return waterArea
}
