import { Point } from '/src/lib/point'

import {
    ContinentSurface,
    IslandSurface,
    OceanSurface,
    SeaSurface,
} from './data'

// chunk
// 0,0   1,0   2,0
// 0,1   1,1   2,1
// 0,2   1,2   2,2


export const buildSideCell = (context) => {
    const surfaceLayer = context.surfaceLayer
    const isPointLand = surfaceLayer.isLand(context.worldPoint)
    const isPointIsland = surfaceLayer.isIsland(context.worldPoint)
    const axis = context.directions[0].axis
    const sidePoint = Point.plus(context.worldPoint, axis)
    const isSidePointSea = surfaceLayer.isSea(sidePoint)
    const isSidePointLand = surfaceLayer.isLand(sidePoint)
    const isSidePointIsland = surfaceLayer.isIsland(sidePoint)
    const bothLand = isPointLand && isSidePointLand
    const bothWater = !isPointLand && !isSidePointLand

    if (bothLand || bothWater) return context.surface
    if (! context.isCellLand && isPointLand) {
        if (isPointIsland) return isSidePointSea ? SeaSurface : OceanSurface
        return context.surface
    }
    const isChunkSea = surfaceLayer.isSea(context.worldPoint)
    // remove land cell on water chunks next to islands
    if (context.isChunkWater && isSidePointIsland) {
        return isChunkSea ? SeaSurface : OceanSurface
    }
    if (context.isCellLand) {
        if (surfaceLayer.isIsland(context.worldPoint))
            return IslandSurface
        return ContinentSurface
    }
    if (surfaceLayer.isSea(context.worldPoint))
        return SeaSurface
    return OceanSurface
}


export const buildCornerCell = (context) => {
    const surfaceLayer = context.surfaceLayer
    const survey = surveySides(context)
    const isChunkSea = surfaceLayer.isSea(context.worldPoint)
    const isChunkIsland = surfaceLayer.isIsland(context.worldPoint)
    const isChunkContinent = surfaceLayer.isContinent(context.worldPoint)
    // remove water inner corners on land chunks
    if (! context.isChunkWater && survey.landSides > 2) {
        return isChunkIsland ? IslandSurface : ContinentSurface
    }
    if (! context.isChunkWater && survey.waterSides > 2) {
        return survey.seaSides > 0 ? SeaSurface : OceanSurface
    }
    if (context.isChunkWater && survey.islandSides > 0) {
        return isChunkSea ? SeaSurface : OceanSurface
    }
    if (context.isCellLand) {
        // eliminate island corners
        const landNearIsland = isChunkContinent && survey.islandSides > 0
        const islandNearLand = isChunkIsland && survey.islandSides == 0
        if (islandNearLand || landNearIsland) {
            return survey.seaSides > 0 ? SeaSurface : OceanSurface
        }
        return isChunkIsland ? IslandSurface : ContinentSurface
    } else {
        // water cells
        if(isChunkSea || survey.seaSides > 0)
            return SeaSurface
        return OceanSurface
    }
}


const surveySides = (context) => {
    const survey = {
        seaSides: 0,
        landSides: 0,
        waterSides: 0,
        islandSides: 0,
    }
    const surfaceLayer = context.surfaceLayer
    for (let direction of context.directions) {
        const sidePoint = Point.plus(context.worldPoint, direction.axis)
        if (surfaceLayer.isLand(sidePoint)) {
            survey.landSides++
        } else {
            survey.waterSides++
        }
        survey.seaSides += surfaceLayer.isSea(sidePoint) ? 1 : 0
        survey.islandSides += surfaceLayer.isIsland(sidePoint) ? 1 : 0
    }
    return survey
}