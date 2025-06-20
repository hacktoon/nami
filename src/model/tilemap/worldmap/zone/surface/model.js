import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'


const SURFACE_NOISE_RATIO = .6


export function buildGrid(context) {
    // const regionSurfaceMap = buildRegionSurfaceMap(context)
    const landWaterGrid = buildLandWaterGrid(context)
    return landWaterGrid
}


function buildLandWaterGrid(context) {
    // generate a grid with (land or water) information in bool
    const {worldPoint, world, rect, zoneRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    return Grid.fromRect(zoneRect, zonePoint => {
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO
    })
}


function  buildRegionSurfaceMap(context) {
    const {world, worldPoint, zone, zoneRect} = context
    const regionSurfaceMap = new Map()
    const isLand = world.surface.isLand(worldPoint)
    const isLake = world.surface.isLake(worldPoint)
    // read first edges, then corners
    // const gridPoints = [...getEdgePoints(zoneRect), ...getCornerPoints(zoneRect)]
    // for (let [zonePoint, direction] of gridPoints) {
    //     const regionId = zone.topology.getRegion(zonePoint)

    //     const worldSidePoint = Point.atDirection(worldPoint, direction)
    //     const sideSurface = world.surface.get(worldSidePoint)
    //     // rule for lake zone
    //     if (isLake && world.surface.isLand(worldSidePoint)) {
    //         regionSurfaceMap.set(regionId, sideSurface)
    //     }
    //     // rule for general land zone
    //     const isSideOcean = world.surface.isOcean(worldSidePoint)
    //     const isSideSea = world.surface.isSea(worldSidePoint)
    //     if (isLand && (isSideOcean || isSideSea)) {
    //         regionSurfaceMap.set(regionId, sideSurface)
    //     }
    // }
    return regionSurfaceMap
}




function getCornerPoints(rect) {
    const xMax = rect.width - 1
    const yMax = rect.height - 1
    return [
        [[0, 0], Direction.NORTHWEST],
        [[xMax, 0], Direction.NORTHEAST],
        [[0, yMax], Direction.SOUTHWEST],
        [[xMax, yMax], Direction.SOUTHEAST],
    ]
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
