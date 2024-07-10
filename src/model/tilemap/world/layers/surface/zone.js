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

    #buildGrid(params) {
        const {worldPoint, layers, zoneRect} = params
        const type = layers.surface.get(worldPoint)
        const regionGrid = this.#buildRegionGrid(params)
        const ctx = {...params, regionGrid}
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

        const zoneEdges = this.#getZoneAnchors(context)
        // generate fill origins for points in zone edges
        let fillId = 0
        const fillMap = new Map()
        const isWorldLand = layers.surface.isLand(worldPoint)
        const isLakeSea = layers.surface.isLake(worldPoint) || layers.surface.isSea(worldPoint)
        for(let [zonePoint, worldSidePoint] of zoneEdges) {
            // const regionId =  regionGrid.get(zonePoint)
            if (isWorldLand) {
                // fill origins are the rect border points
                if (layers.surface.isOcean(worldSidePoint)) {
                    fillMap.set(fillId++, zonePoint)
                }
            } else if (isLakeSea) {
                if (layers.surface.isContinent(worldSidePoint)) {
                    fillMap.set(fillId++, zonePoint)
                }
            }
        }
        const [mx, my] = layers.basin.getMidpoint(worldPoint)
        const middle = [mx, my].map(p => Math.floor((p * 100) / zoneSize))
        if (isWorldLand) {
            // new ContinentErosionFill(fillMap, context).step()  // run just one fill step
        }
    }

    #getZoneAnchors(context) {
        const {worldPoint, zoneRect, regionGrid} = context
        const rectEdges = []
        const grid = Grid.fromRect(zoneRect, zonePoint => {
            const regionId =  regionGrid.get(zonePoint)
            if (this.#rect.isCorner(zonePoint)) {
                const direction = getCornerDirection(zonePoint, this.#rect)
                const worldSidePoint = Point.atDirection(worldPoint, direction)
                rectEdges.push([zonePoint, worldSidePoint])
            } else if (this.#rect.isEdge(zonePoint)) {
                const direction = getEdgeDirection(zonePoint, this.#rect)
                const worldSidePoint = Point.atDirection(worldPoint, direction)
                rectEdges.push([zonePoint, worldSidePoint])
            }
        })
        return rectEdges
    }

    get(point) {
        const surfaceId = this.#grid.get(point)
        return Surface.parse(surfaceId)
    }
}


function getCornerDirection([x, y], rect) {
    const xEdge = rect.width - 1
    const yEdge = rect.height - 1
    if (x === 0 && y === 0) return Direction.NORTHWEST
    if (x === 0 && y === yEdge) return Direction.SOUTHWEST
    if (x === xEdge && y === 0) return Direction.NORTHEAST
    if (x === xEdge && y === yEdge) return Direction.SOUTHEAST
}


function getEdgeDirection([x, y], rect) {
    if (y === 0) return Direction.NORTH
    if (x === 0) return Direction.WEST
    if (y === rect.height - 1) return Direction.SOUTH
    if (x === rect.width - 1) return Direction.EAST
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
