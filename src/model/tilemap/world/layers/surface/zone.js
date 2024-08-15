import { Point } from '/src/lib/point'
import { EvenPointSampling } from '/src/lib/point/sampling'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Surface } from './data'
import { RegionFloodFill } from './fill'


const SCALE = 2
const CHANCE = .1
const GROWTH = 4
const EMPTY = null


export class ZoneSurface {
    #grid

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        this.point = worldPoint
        this.size = params.zoneSize
        this.#grid = this.#buildGrid({...params, worldPoint})
    }

    #buildGrid(context) {
        const regionGrid = this.#buildRegionGrid(context)
        // const wirePoints = this.#buildWirePoints({...context, regionGrid, regionTypeMap})
        const regionTypeMap = this.#buildRegionTypeMap({...context, regionGrid})
        const zoneGrid = this.#buildZoneGrid({...context, regionGrid, regionTypeMap})
        return zoneGrid
    }

    #buildRegionGrid(context) {
        // create a grid with many regions fragmenting the zone map
        const regionGrid = Grid.fromRect(context.zoneRect, () => EMPTY)
        const origins = EvenPointSampling.create(context.zoneRect, SCALE)
        const fillMap = new Map(origins.map((origin, id) => [id, origin]))
        const ctx = {...context, regionGrid, chance: CHANCE, growth: GROWTH}
        new RegionFloodFill(fillMap, ctx).complete()
        return regionGrid
    }

    #buildRegionTypeMap(context) {
        const {layers, worldPoint, zoneRect, regionGrid} = context
        const regionTypeMap = new Map()
        const isLand = layers.surface.isLand(worldPoint)
        const isLake = layers.surface.isLake(worldPoint)
        iterateEdgePoints(zoneRect, (zonePoint, direction) => {
            const regionId = regionGrid.get(zonePoint)
            const worldSidePoint = Point.atDirection(worldPoint, direction)
            const sideSurface = layers.surface.get(worldSidePoint)
            // rule for lake zones
            if (isLake && layers.surface.isLand(worldSidePoint)) {
                regionTypeMap.set(regionId, sideSurface)
            }
            // rule for general land zones
            const isSideOcean = layers.surface.isOcean(worldSidePoint)
            const isSideSea = layers.surface.isSea(worldSidePoint)
            if (isLand && (isSideOcean || isSideSea)) {
                regionTypeMap.set(regionId, sideSurface)
            }
        })
        return regionTypeMap
    }

    #buildZoneGrid(context) {
        // final grid generator
        const {worldPoint, layers, regionGrid, zoneRect, regionTypeMap} = context
        const midpoint = layers.basin.getMidpoint(worldPoint)
        return Grid.fromRect(zoneRect, zonePoint => {
            const regionId = regionGrid.get(zonePoint)
            // default surface type
            let surface = layers.surface.get(worldPoint)
            if (regionTypeMap.has(regionId)) {
                surface = regionTypeMap.get(regionId)
            }
            if (Point.equals(midpoint, zonePoint)) {
                surface = layers.surface.get(worldPoint)
            }

            return surface.id
        })
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}

// #buildWirePoints(context) {
//     // reads the wire data and create points for zone grid
//     const {layers, worldPoint, regionGrid, zoneRect} = context
//     const midpoint = layers.basin.getMidpoint(worldPoint)
//     const directions = layers.basin.getWirePathAxis(worldPoint)
//     for(let directionAxis of directions) {
//         // const regionId = regionGrid.get(zonePoint)
//     }
// }

function iterateEdgePoints(rect, callback) {
    const wMax = rect.width - 1
    const hMax = rect.height - 1
    // horizontal sweep
    for (let x = 0; x < rect.width; x++) {
        // top points
        const topDir = x == 0 ? Direction.NORTHWEST : (x == wMax ? Direction.NORTHEAST : Direction.NORTH)
        callback([x, 0], topDir)
        // bottom points
        const bottomDir = x == 0 ? Direction.SOUTHWEST : (x == wMax ? Direction.SOUTHEAST : Direction.SOUTH)
        callback([x, hMax], bottomDir)
    }
    // vertical sweep (avoid visited corners)
    for (let y = 1; y < hMax; y++) {
        // left points
        callback([0, y], Direction.WEST)
        // right points
        callback([wMax, y], Direction.EAST)
    }
}
