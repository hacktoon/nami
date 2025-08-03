import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'
import { Random } from '/src/lib/random'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'

import { buildRegionGridMap } from './region'


const SURFACE_NOISE_RATIO = .6
const REGION_WATER = false
const REGION_LAND = true
const EMPTY = null

const FILL_GROWTH = [2, 1]
const FILL_CHANCE = .1


export function buildModel(context) {
    const regionGridContext = buildRegionGridMap(context)
    const directionTypeMap = buildDirectionTypeMap(context)
    const landMaskGrid = buildLandMaskGrid({...context, ...regionGridContext, directionTypeMap})
    return {landMaskGrid, ...regionGridContext}
}


function  buildDirectionTypeMap(context) {
    const {world, worldPoint} = context
    const surfaceLayer = world.surface
    const directionTypeMap = new Map()
    const isWorldPointLand = surfaceLayer.isLand(worldPoint)
    // set center region
    directionTypeMap.set(Direction.CENTER.id, isWorldPointLand)
    // set adjacents regions
    Point.adjacents(worldPoint, (sidePoint, direction) => {
        const isSideLand = surfaceLayer.isLand(sidePoint)
        if (isWorldPointLand == isSideLand) {
            directionTypeMap.set(direction.id, isSideLand)
        }
    })
    // set diagonal regions
    Point.diagonals(worldPoint, (sidePoint, direction) => {
        const ortoDirs = Direction.getComponents(direction)
        const orto1 = Point.atDirection(worldPoint, ortoDirs[0])
        const orto2 = Point.atDirection(worldPoint, ortoDirs[1])
        if (isWorldPointLand) {
            const sameType = surfaceLayer.isLand(sidePoint)
            const ortoDiff = surfaceLayer.isWater(orto1) && surfaceLayer.isWater(orto2)
            if (sameType && ortoDiff)
                directionTypeMap.set(direction.id, REGION_WATER)
        } else {
            const sameType = surfaceLayer.isWater(sidePoint)
            const ortoDiff = surfaceLayer.isLand(orto1) && surfaceLayer.isLand(orto2)
            if (sameType && ortoDiff)
                directionTypeMap.set(direction.id, REGION_WATER)
        }
    })
    return directionTypeMap
}


function buildLandMaskGrid(context) {
    // Generate a boolean grid (land or water)
    const {
        worldPoint, world, rect, zoneRect, regionGrid,
        directionTypeMap, regionDirMap
    } = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    return Grid.fromRect(zoneRect, zonePoint => {
        // if (! world.surface.isBorder(worldPoint)) {
        //     return world.surface.isLand(worldPoint)
        // }
        const regionId = regionGrid.get(zonePoint)
        const regionDirId = regionDirMap.get(regionId)
        const regionType = directionTypeMap.get(regionDirId)
        // if (regionType === REGION_LAND || regionType === REGION_WATER) {
        //     return regionType
        // }
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
}


class AreaFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(FILL_GROWTH) }
    getChance() { return FILL_CHANCE }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.regionGrid.set(fillPoint, fill.id)
    }
}
