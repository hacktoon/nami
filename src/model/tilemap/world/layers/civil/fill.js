import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'


const CHANCE = .1  // chance of fill growing
const GROWTH = 15  // make fill basins grow bigger than others
const EMPTY = 0  // make fill basins grow bigger than others


export function buildRealms(rect, layers, context) {
    const fill = new RealmFill()
    const realmGrid = Grid.fromRect(rect, () => EMPTY)
    const origins = context.capitalPoints.points
    fill.start(origins, {
        rect, layers,
        idCount: 1,  // start from 1 to avoid 0 index
        realmGrid,   // code -x for water, +x for land
        ...context,
    })
    return realmGrid
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint) {
        const {
            layers, rect, realmGrid, colorMap, realmNameMap
        } = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const idCount = fill.id + 1  // offset to avoid index 0
        const id = layers.surface.isWater(wrappedPoint) ? -idCount : idCount
        realmGrid.set(wrappedPoint, id)
        colorMap.set(idCount, new Color())
        realmNameMap.set(idCount, Random.choiceFrom(WORLD_NAMES))
    }

    onFill(fill, fillPoint) {
        const {layers, rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const idCount = fill.id + 1  // offset to avoid index 0
        const id = layers.surface.isWater(wrappedPoint) ? -idCount : idCount
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
