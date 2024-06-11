import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'
import { Rect } from '/src/lib/number'


export class ZoneRiver {
    #grid
    #layers
    #rect

    constructor(worldPoint, {layers, zoneSize}) {
        // rect scaled to world size, for noise locality
        this.point = worldPoint
        this.size = zoneSize
        this.#rect = new Rect(zoneSize, zoneSize)
        this.#grid = this.#buildGrid(layers)
    }

    #buildGrid(layers) {


    }

    get(point) {

    }
}


class ZoneLitoralFill extends ConcurrentFill {
    onInitFill(fill, fillPoint) {
        const {grid} = fill.context
        grid.set(fillPoint, OceanSurface.id)
    }

    getChance(fill) { return Random.float(.3, .6) }
    getGrowth(fill) { return Random.int(1, 6) }

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
