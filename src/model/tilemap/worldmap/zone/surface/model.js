import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { FIFOCache } from '/src/lib/cache'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'

import { buildRegionGridMap } from './region'


const SURFACE_NOISE_RATIO = .6
const SURFACE_GRID_CACHE = new FIFOCache(256)
const REGION_WATER = 0
const REGION_LAND = 1


export function buildModel(context) {
    const hash = Point.hash(context.worldPoint)
    // cache de zone grid noise
    if (SURFACE_GRID_CACHE.has(hash)) {
        return SURFACE_GRID_CACHE.get(hash)
    }
    const regionGridContext = buildRegionGridMap(context)
    const regionSurfaceMap = buildRegionSurfaceMap({...context, ...regionGridContext})
    const landMaskGrid = buildLandMaskGrid({...context, ...regionGridContext, regionSurfaceMap})
    const model = {landMaskGrid, ...regionGridContext}
    SURFACE_GRID_CACHE.set(hash, model)
    return model
}


function  buildRegionSurfaceMap(context) {
    const {world, worldPoint} = context
    const surfaceTypeMap = new Map()
    const isWorldPointLand = world.surface.isLand(worldPoint)

    Point.around(worldPoint, (sidePoint, direction) => {
        if (isWorldPointLand) {
            if (world.surface.isLand(sidePoint)) {
                if (isWaterChannel(context, direction)) {
                    surfaceTypeMap.set(direction.id, REGION_WATER)
                } else {
                    surfaceTypeMap.set(direction.id, REGION_LAND)
                }
            }
        } else {
            surfaceTypeMap.set(direction.id, REGION_WATER)
        }
    })
    return surfaceTypeMap
}


function isWaterChannel(context, direction) {
    const {world, worldPoint} = context
    const ortoDirs = Direction.getComponents(direction)
    if (ortoDirs.length != 2) return false
    const isWater1 = world.surface.isWater(Point.atDirection(worldPoint, ortoDirs[0]))
    const isWater2 = world.surface.isWater(Point.atDirection(worldPoint, ortoDirs[1]))
    return isWater1 && isWater2
}


function buildLandMaskGrid(context) {
    /*
        Generate a boolean grid (land or water)
    */
    const {worldPoint, world, rect, zoneRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    return Grid.fromRect(zoneRect, zonePoint => {
        // if (! world.surface.isBorder(worldPoint)) {
        //     return world.surface.isLand(worldPoint)
        // }
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
}


function getEdgePoints(rect) {
    const xMax = rect.width - 1
    const yMax = rect.height - 1
    const points = []
    // horizontal sweep
    for (let x = 0; x <= xMax; x++) {
        points.push([[x, 0], Direction.NORTH])
        points.push([[x, yMax], Direction.SOUTH])
    }
    // vertical sweep (avoid visited corners)
    for (let y = 0; y <= yMax; y++) {
        points.push([[0, y], Direction.WEST])
        points.push([[xMax, y], Direction.EAST])
    }
    return points
}
