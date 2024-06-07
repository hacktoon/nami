import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'
import { Rect } from '/src/lib/number'
import { Grid } from '/src/lib/grid'
import {
    Surface,
    ContinentSurface,
    OceanSurface,
} from './data'


export class ZoneSurface {
    #grid
    #layers
    #rect

    constructor(worldPoint, {layers, zoneSize}) {
        // rect scaled to world size, for noise locality
        this.point = worldPoint
        this.size = zoneSize
        this.#layers = layers
        this.#rect = new Rect(zoneSize, zoneSize)
        this.#grid = this.#buildGrid(layers)
    }

    #buildGrid(layers) {
        const isWorldPointWater = layers.surface.isWater(this.point)
        const borderPoints = new PointSet(this.#rect)
        const waterSideDirs = this.#getWaterNeighbors(layers)
        const grid = Grid.fromRect(this.#rect, zonePoint => {
            if (this.#isZoneBorderWater(zonePoint, waterSideDirs)) {
                borderPoints.add(zonePoint)
            }
            return isWorldPointWater ? OceanSurface.id : ContinentSurface.id
        })
        // design the litoral outline
        const context = {
            worldPoint: this.point,
            layers: this.#layers,
            rect: this.#rect,
            grid,
        }
        // run just one fill step
        new ZoneLitoralFill(borderPoints.points, context).stepFill()
        return grid
    }

    #getWaterNeighbors(layers) {
        const directions = new Set()
        if (layers.surface.isLand(this.point)) {
            Point.around(this.point, (point, direction) => {
                if (layers.surface.isWater(point)) {
                    directions.add(direction.id)
                }
            })
        }
        return directions
    }

    #isZoneBorderWater(zonePoint, waterSideDirs) {
        if (this.#rect.isCorner(zonePoint)) {  // is at zone grid corner?
            const zoneDir = getCornerDirection(zonePoint, this.#rect)
            return waterSideDirs.has(zoneDir.id)
        }
        if (this.#rect.isEdge(zonePoint)) {  // is at zone grid edge?
            const zoneDir = getEdgeDirection(zonePoint, this.#rect)
            return waterSideDirs.has(zoneDir.id)
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


class ZoneLitoralFill extends ConcurrentFill {
    onInitFill(fill, fillPoint) {
        const {grid} = fill.context
        grid.set(fillPoint, OceanSurface.id)
    }

    getChance(fill) { return .4 }
    getGrowth(fill) { return 4 }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.rect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }

    canFill(fill, fillPoint) {
        const {grid} = fill.context
        return grid.get(fillPoint) === ContinentSurface.id
    }

    onFill(fill, fillPoint) {
        const {grid} = fill.context
        grid.set(fillPoint, OceanSurface.id)
    }
}
