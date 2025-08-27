import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/geometry/point/set'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'


const MEANDER = 3


export function buildModel(context) {
    return {}
}


class CivilFloodFill extends ConcurrentFill {
    getGrowth() { return 1 }
    getChance() { return .5 }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.watermaskGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.watermaskGrid.set(fillPoint, fill.id)
    }
}