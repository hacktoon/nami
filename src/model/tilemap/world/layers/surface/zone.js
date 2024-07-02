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
        const {worldPoint, layers, zoneRect, neighborSurvey} = context
        const isLand = layers.surface.isLand(worldPoint)
        const fillMap = new Map()
        let fillId = 0
        Grid.fromRect(zoneRect, zonePoint => {
            if (isLand) {
                if (this.#isZonePointBorder(zonePoint, neighborSurvey)) {
                    // fill origins are the rect border points
                    fillMap.set(fillId++, zonePoint)
                }
            } else {

            }
        })
        new ContinentErosionFill(fillMap, context).step()  // run just one fill step
    }

    #surveyNeighbors(params) {
        // survey neighbors and directions
        const {worldPoint, layers} = params
        let hasOceanNeighbor = false
        const waterSideDirs = new Set()
        if (layers.surface.isLand(worldPoint)) {
            Point.around(worldPoint, (neighbor, direction) => {
                hasOceanNeighbor = !hasOceanNeighbor && layers.surface.isOcean(neighbor)
                if (layers.surface.isWater(neighbor)) {
                    waterSideDirs.add(direction.id)
                }
            })
        }
        return {waterSideDirs, hasOceanNeighbor}
    }

    #isZonePointBorder(zonePoint, neighborSurvey) {
        if (this.#rect.isCorner(zonePoint)) {  // is at zone grid corner?
            const zoneDir = getCornerDirection(zonePoint, this.#rect)
            return neighborSurvey.waterSideDirs.has(zoneDir.id)
        }
        if (this.#rect.isEdge(zonePoint)) {  // is at zone grid edge?
            const zoneDir = getEdgeDirection(zonePoint, this.#rect)
            return neighborSurvey.waterSideDirs.has(zoneDir.id)
        }
        return false
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


class ContinentErosionFill extends ConcurrentFill {
    onInitFill(fill, fillPoint) {
        const {baseGrid} = fill.context
        baseGrid.set(fillPoint, OceanSurface.id)
    }

    getChance(fill) { return Random.float(.3, .6) }
    getGrowth(fill) { return Random.int(1, 6) }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }

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
