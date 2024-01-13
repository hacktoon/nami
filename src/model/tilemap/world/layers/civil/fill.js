import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const EMPTY = null  // make fill basins grow bigger than others


export function buildRealmGrid(rect, layers, capitalPoints) {
    const fill = new RealmFill()
    const realmGrid = Grid.fromRect(rect, () => EMPTY)
    fill.start(capitalPoints.points, {rect, layers, realmGrid})
    return realmGrid
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onFill(fill, fillPoint) {
        const {rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        realmGrid.set(wrappedPoint, fill.id)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        return realmGrid.get(wrappedPoint) == EMPTY
    }
}
