import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
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
        const baseGrid = Grid.fromRect(zoneRect, () => type.id)
        const neighborSurvey = this.#surveyNeighbors(params)
        const ctx = {...params, baseGrid, neighborSurvey}
        this.#buildContinentZoneGrid(ctx)
        return baseGrid
    }

    #buildContinentZoneGrid(context) {
        const {worldPoint, layers, baseGrid, zoneSize, zoneRect} = context
        const type = layers.surface.get(worldPoint)
        const rectEdges = []
        // survey points
        Grid.fromRect(zoneRect, zonePoint => {
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
        // generate fill origins for points in zone edges
        let fillId = 0
        const fillMap = new Map()
        const isWorldLand = layers.surface.isLand(worldPoint)
        const isLakeSea = layers.surface.isLake(worldPoint) || layers.surface.isSea(worldPoint)
        for(let [zonePoint, worldSidePoint] of rectEdges) {
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
            new ContinentErosionFill(fillMap, context).step()  // run just one fill step

            // fill one blob in zone rect midpoint
            const postFillMap = new Map([[0, middle]])
            const postFill = new PostErosionFill(postFillMap, {...context, active: true})
            postFill.step()
            postFill.step()

        } else if (isLakeSea) {
            new LakeSeaErosionFill(fillMap, context).step()
        }
    }

    #surveyNeighbors(params) {
        // survey neighbors and directions
        const {worldPoint, layers} = params
        const waterSideDirs = new Set()
        // if (layers.surface.isLand(worldPoint)) {
        //     Point.around(worldPoint, (neighbor, direction) => {

        //     })
        // }
        return {waterSideDirs}
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


class ErosionFill extends ConcurrentFill {
    getChance(fill) { return Random.float(.1, .5) }
    getGrowth(fill) { return Random.int(3, 6) }
    canFill(fill, fillPoint) { return true }
    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }
}


class ContinentErosionFill extends ErosionFill {
    canFill(fill, fillPoint) {
        const {baseGrid} = fill.context
        const id = baseGrid.get(fillPoint)
        return [IslandSurface.id, ContinentSurface.id].includes(id)
    }

    onFill(fill, fillPoint) {
        const {baseGrid} = fill.context
        baseGrid.set(fillPoint, OceanSurface.id)
    }
}


class LakeSeaErosionFill extends ErosionFill {
    getChance(fill) { return Random.choice(.1, .5) }
    getGrowth(fill) { return 3 }

    onFill(fill, fillPoint) {
        const {baseGrid} = fill.context
        baseGrid.set(fillPoint, ContinentSurface.id)
    }
}


class PostErosionFill extends ErosionFill {
    getChance(fill) { return Random.choice(.1, .6) }
    getGrowth(fill) { return 1 }

    canFill(fill, fillPoint, parentPoint) {
        const {zoneRect} = fill.context
        return fill.context.active
    }

    onFill(fill, fillPoint) {
        const {baseGrid} = fill.context
        baseGrid.set(fillPoint, ContinentSurface.id)
    }
}