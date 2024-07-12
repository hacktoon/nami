import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { EvenPointSampling } from '/src/lib/point/sampling'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import {
    Surface,
    ContinentSurface,
    OceanSurface,
    SeaSurface,
    LakeSurface,
    IslandSurface,
} from './data'



const SCALE = null
const EMPTY = null


export class ZoneSurface {
    #grid
    #rect

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        this.point = worldPoint
        this.size = params.zoneSize
        this.#rect = params.zoneRect
        this.#grid = this.#buildGrid({...params, worldPoint})
    }

    #buildGrid(context) {
        const {worldPoint, layers, zoneRect} = context
        const type = layers.surface.get(worldPoint)
        const regionGrid = this.#buildRegionGrid(context)
        const ctx = {...context, regionGrid}
        this.#buildZoneGrid(ctx)
        const baseGrid = Grid.fromRect(zoneRect, () => type.id)
        return baseGrid
    }

    #buildRegionGrid(context) {
        const regionGrid = Grid.fromRect(context.zoneRect, () => EMPTY)
        const origins = EvenPointSampling.create(context.zoneRect, SCALE)
        const fillMap = new Map(origins.map((origin, id) => [id, origin]))
        const ctx = {...context, regionGrid}
        new RegionFloodFill(fillMap, ctx).complete()
        return regionGrid
    }

    #buildZoneGrid(context) {
        const {worldPoint, layers, zoneSize} = context
        const regionMap = this.#buildRegionMap(context)
        // generate fill origins for points in zone edges
        let fillId = 0
        const isWorldLand = layers.surface.isLand(worldPoint)
        const isLakeSea = layers.surface.isLake(worldPoint) || layers.surface.isSea(worldPoint)

        const [mx, my] = layers.basin.getMidpoint(worldPoint)
        const middle = [mx, my].map(p => Math.floor((p * 100) / zoneSize))

        return regionMap
    }

    #buildRegionMap(context) {
        const {layers, worldPoint, zoneRect, regionGrid} = context
        const typeMap = new Map()
        // set type from world point
        let type = layers.surface.get(worldPoint)
        iterateOuterPoints(zoneRect, (zonePoint, direction) => {
            const regionId = regionGrid.get(zonePoint)
            const worldSidePoint = Point.atDirection(worldPoint, direction)
            type = this.#buildGridType(context, zonePoint, worldSidePoint)
            typeMap.set(regionId, type.id)
            // if (Point.equals(worldPoint, [51, 38]))
            //     console.log(zonePoint, worldSidePoint, direction.name, regionId)

        })
        return typeMap
    }

    #buildGridType(context, zonePoint, worldSidePoint) {
        const {layers, worldPoint} = context
        if (layers.surface.isContinent(worldPoint)) {
            if (layers.surface.isOcean(worldSidePoint)) return OceanSurface

        } else {
            if (layers.surface.isIsland(worldPoint)) {
                type = IslandSurface
            }
        }
        return type
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}


export class RegionFloodFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }
    getChance(fill) { return 0.2 }
    getGrowth(fill) { return 1 }

    onInitFill(fill, fillPoint, neighbors) {
        fill.context.regionGrid.set(fillPoint, fill.id)
    }

    canFill(fill, point, center) {
        return fill.context.regionGrid.get(point) === EMPTY
    }

    onFill(fill, point, center) {
        fill.context.regionGrid.set(point, fill.id)
    }
}


function iterateOuterPoints(rect, callback) {
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
        callback([0, y], Direction.EAST)
        // right points
        callback([wMax, y], Direction.WEST)
    }
}