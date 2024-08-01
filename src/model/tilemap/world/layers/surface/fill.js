import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const EMPTY = null


export class RegionFloodFill extends ConcurrentFill {
    getChance(fill) { return 0.2 }
    getGrowth(fill) { return 3 }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }

    onInitFill(fill, fillPoint, neighbors) {
        fill.context.regionGrid.set(fillPoint, fill.id)
    }

    canFill(fill, point, center) {
        return fill.context.regionGrid.get(point) === EMPTY
    }

    onFill(fill, point, center) {
        fill.context.regionGrid.set(point, fill.id)
    }

    onBlockedFill(fill, fillPoint, parentPoint) {
        const {regionGrid, regionTypeMap} = fill.context
        // regionTypeMap.set(fill.id)
        // regionGrid.set(fillPoint, fill.id)
    }
}