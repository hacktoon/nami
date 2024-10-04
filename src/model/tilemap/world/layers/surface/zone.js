import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'
import { ContinentSurface, OceanSurface, Surface } from './data'
import { buildRegionGrid } from './fill'


export class ZoneSurface {
    #grid

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        this.size = params.zoneSize
        this.#grid = this.#buildGrid({...params, worldPoint})
    }

    #buildGrid(context) {
        const regionGrid = buildRegionGrid(context)
        const regionSurfaceMap = this.#buildRegionSurfaceMap({...context, regionGrid})
        const zoneGrid = this.#buildZoneGrid({...context, regionGrid, regionSurfaceMap})
        return zoneGrid
    }

    #buildRegionSurfaceMap(context) {
        const {layers, worldPoint, zoneRect, regionGrid} = context
        const regionSurfaceMap = new Map()
        const isLand = layers.surface.isLand(worldPoint)
        const isLake = layers.surface.isLake(worldPoint)
        // read first edges, then corners
        const gridPoints = [...getEdgePoints(zoneRect), ...getCornerPoints(zoneRect)]
        for (let [zonePoint, direction] of gridPoints) {
            const regionId = regionGrid.get(zonePoint)
            const worldSidePoint = Point.atDirection(worldPoint, direction)
            const sideSurface = layers.surface.get(worldSidePoint)
            // rule for lake zones
            if (isLake && layers.surface.isLand(worldSidePoint)) {
                regionSurfaceMap.set(regionId, sideSurface)
            }
            // rule for general land zones
            const isSideOcean = layers.surface.isOcean(worldSidePoint)
            const isSideSea = layers.surface.isSea(worldSidePoint)
            if (isLand && (isSideOcean || isSideSea)) {
                regionSurfaceMap.set(regionId, sideSurface)
            }
        }
        return regionSurfaceMap
    }

    #buildZoneGrid(context) {
        // final grid generator
        const {worldPoint, layers, rect, zoneRect, regionGrid, regionSurfaceMap} = context
        const midpoint = layers.basin.getMidpoint(worldPoint)
        return Grid.fromRect(zoneRect, zonePoint => {
            // const regionId = regionGrid.get(zonePoint)
            // // default surface type
            // let surface = layers.surface.get(worldPoint)
            // if (regionSurfaceMap.has(regionId)) {
            //     surface = regionSurfaceMap.get(regionId)
            // }
            // if (Point.equals(midpoint, zonePoint)) {
            //     surface = layers.surface.get(worldPoint)
            // }
            const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
            const noiseRect = Rect.multiply(rect, zoneRect.width)
            const noisePoint = Point.plus(relativePoint, zonePoint)
            const noise = layers.noise.get4D(noiseRect, noisePoint, "outline")
            if (noise > 0.5) {
                return ContinentSurface.id
            }
            return OceanSurface.id

            return surface.id
        })
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
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
