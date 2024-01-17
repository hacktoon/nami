import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
// import { } from './data'

const EMPTY = 0  // make fill basins grow bigger than others


export function buildRoadMap(rect, layers, context) {
    const cityPoints = context.cityPoints

}



class RoadFill extends ConcurrentFill {
    onFill(fill, fillPoint) {
        const {layers, rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const realmId = fill.id + 1  // offset to avoid index 0
        const id = layers.surface.isWater(wrappedPoint) ? -realmId : realmId
        realmGrid.set(wrappedPoint, id)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        return realmGrid.get(wrappedPoint) === EMPTY
    }
}
