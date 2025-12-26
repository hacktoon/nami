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


const LAND = 0
const WATER = 1
// Area ratios
const SURFACE_RATIO = .6
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .05
const MINIMUN_CONTINENT_RATIO = 1

export const EMPTY = null


export function buildSurfaceModel(context) {
    const {rect, world} = context
    // detect land or water tiles in the grid
    const landWaterGrid = detectLandWater(rect, world)
    // detect surface type by filling empty bodies
    const {bodyGrid, bodyTypeMap, bodyAreaMap} = detectBodies(context, landWaterGrid)
    const borderTypeGrid = detectBorderTypes(context, bodyTypeMap, bodyGrid)
    const waterArea = readWaterArea(bodyTypeMap, bodyAreaMap)
    return {
        body: bodyGrid,
        bodyType: bodyTypeMap,
        bodyArea: bodyAreaMap,
        borderType: borderTypeGrid,
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


function detectBodies(baseContext, landWaterGrid) {
    // flood fill "empty" points and determine body type by total area
    let bodyId = 1
    const bodyTypeMap = new Map()
    const bodyAreaMap = new Map()
    const bodyGrid = Grid.fromRect(baseContext.rect, () => EMPTY)
    const context = {...baseContext, bodyGrid, landWaterGrid}

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


function detectBorderTypes(context, bodyTypeMap, bodyGrid) {
    const getType = point => {
        const bodyId = bodyGrid.get(point)
        return Surface.parse(bodyTypeMap.get(bodyId))
    }
    return Grid.fromRect(context.rect, point => {
        let type = getType(point)
        for (let sidePoint of Point.adjacents(point)) {
            const sideType = getType(sidePoint)
            if (type.isWater && ! sideType.isWater || ! type.isWater && sideType.isWater) {
                return sideType.id
            }
        }
        return Surface.id
    })
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
