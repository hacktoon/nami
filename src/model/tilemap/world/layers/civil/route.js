import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'


const EMPTY = 0  // make fill basins grow bigger than others


export function buildRoadMap(rect, layers, context) {
    const cityPoints = context.cityPoints

}



class RoadFill extends ConcurrentFill {
    onFill(fill, fillPoint) {
        const {layers, rect} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const isWater = layers.surface.isWater(wrappedPoint)
        roadGrid.set(wrappedPoint, id)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {rect, roadGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        return roadGrid.get(wrappedPoint) === EMPTY
    }
}
