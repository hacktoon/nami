import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { FIFOCache } from '/src/lib/cache'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'

import { buildRegionGridMap } from './region'


const SURFACE_NOISE_RATIO = .6
const SURFACE_GRID_CACHE = new FIFOCache(256)

const m = [

]


export function buildModel(context) {
    const hash = Point.hash(context.worldPoint)
    // cache de zone grid noise
    if (SURFACE_GRID_CACHE.has(hash)) {
        return SURFACE_GRID_CACHE.get(hash)
    }
    const {regionGrid, originMap, regionColorMap} = buildRegionGridMap(context)
    // const regionTypes = buildRegionSurfaceMap({...context, regionGrid})
    const landMaskGrid = buildLandMaskGrid(context)
    const model = {landMaskGrid, regionGrid, originMap, regionColorMap}
    SURFACE_GRID_CACHE.set(hash, model)
    return model
}


function  buildRegionSurfaceMap(context) {
    const {world, worldPoint, regionGrid, zoneRect} = context
    const regionTypes = new Map()
    const isWorldPointLand = world.surface.isLand(worldPoint)
    const middle = Math.floor(zoneRect.with / 2)
    const midPoint = [middle, middle]
    // const isLake = world.surface.isLake(worldPoint)
    Point.around(worldPoint, (sidePoint, direction) => {
        if (isWorldPointLand) {
            if (world.surface.isLand(sidePoint)) {
                if (isWaterChannel(context, direction)) {
                    // mark regions as water  for in 4n square
                    if (Point.equals(worldPoint, [39, 8])) {
                        console.log(worldPoint, direction);
                    }
                } else {
                    const x = selectRegionsInLine(context, midPoint, direction)
                    // mark regions as land
                }
            }
        } else {
            // water
            if (world.surface.isLand(sidePoint)) {
                if (world.river.has(sidePoint)) {

                }
            } else {
                // mark regions as water
            }
        }
    })
    return regionTypes
}


function isWaterChannel(context, direction) {
    const {world, worldPoint} = context
    const ortoDirs = Direction.getComponents(direction)
    if (ortoDirs.length != 2) return false
    const isWater1 = world.surface.isWater(Point.atDirection(worldPoint, ortoDirs[0]))
    const isWater2 = world.surface.isWater(Point.atDirection(worldPoint, ortoDirs[1]))
    return isWater1 && isWater2
}


function selectRegionsInLine(context, midPoint, direction) {
    const {worldPoint, regionGrid, zoneRect} = context
    const regions = []
    direction.axis
    // regionGrid.get(zonePoint)
    return regions
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
        return noise > SURFACE_NOISE_RATIO
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
