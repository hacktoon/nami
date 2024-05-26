import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'
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
    #rect

    constructor(worldPoint, {layers, zoneSize}) {
        // rect scaled to world size, for noise locality
        this.#rect = new Rect(zoneSize, zoneSize)
        this.#grid = this.#buildGrid(worldPoint, layers)
        this.size = zoneSize
    }

    #buildGrid(worldPoint, layers) {
        const isWorldPointWater = layers.surface.isWater(worldPoint)
        // const noiseLayer = layers.noise
        // const baseZonePoint = Point.multiplyScalar(worldPoint, zoneSize)
        // const point = Point.plus(baseZonePoint, indexPoint)
        // const noise = noiseLayer.get2D(point, 'grained')
        const waterDirectionIds = this.#getWaterNeighbors(layers, worldPoint)
        // init grid
        const grid = Grid.fromRect(this.#rect, () => {
            return isWorldPointWater ? OceanSurface.id : ContinentSurface.id
        })
        Grid.fromRect(this.#rect, indexPoint => {
            // check each tile in zone grid
            if (this.#rect.isEdgeMiddle(indexPoint)) {
                const dir = getEdgeDirection(indexPoint, this.#rect)
                if (waterDirectionIds.has(dir.id)) {

                }
                if (Point.equals([41, 37], worldPoint)) {
                    // console.log(indexPoint);
                }
                // if ()
                //     carveShoreline(indexPoint, grid)
                    // borderPoints.push(indexPoint)
            }
            //  else if (this.#rect.isEdge(indexPoint)) {
            //     const dir = getEdgeDirection(indexPoint, this.#rect)
            //     // if (waterDirectionIds.has(dir.id))
            //     //     borderPoints.push(indexPoint)
            // } else if (this.#rect.isCorner(indexPoint)) {
            //     const dir = getCornerDirection(indexPoint, this.#rect)
            //     if (waterDirectionIds.has(dir.id))
            //         borderPoints.push(indexPoint)
            // }
            return ContinentSurface.id
        })
        return grid
    }

    #getWaterNeighbors(layers, worldPoint) {
        const directions = new Set()
        if (layers.surface.isLand(worldPoint)) {
            Point.around(worldPoint, (point, direction) => {
                if (layers.surface.isWater(point)) {
                    directions.add(direction.id)
                }
            })
        }
        return directions
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


export function carveShoreline(originPoint, grid) {
    const fill = new ZoneFill()
    fill.start(originPoint, {grid})
}


class ZoneFill extends ConcurrentFill {
    onInitFill(fill, fillPoint) {
        const {rect, grid} = fill.context
        grid.set(fillPoint, OceanSurface.id)
    }

    getChance(fill) { return .1 }
    getGrowth(fill) { return 1 }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {grid} = fill.context
        return grid.get(fillPoint) == ContinentSurface.id
    }

    onFill(fill, fillPoint) {
        const {rect, grid} = fill.context
        grid.set(fillPoint, 1)
    }
}
