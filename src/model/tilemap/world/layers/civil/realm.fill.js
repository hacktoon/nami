import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const EMPTY = 0  // make fill basins grow bigger than others


export function buildRealmGrid(context) {
    const fill = new RealmFill()
    const realmGrid = Grid.fromRect(context.rect, () => EMPTY)
    // start fill from capitals to define realms territory
    fill.start(context.capitalPoints, {realmGrid, ...context})
    return realmGrid
}


export function buildRealmMap(context) {
    const realmMap = new Map()
    for (let point of context.realmPoints) {
        const realmId = context.realmGrid.get(point)
        // create a realm object
        realmMap.set(realmId, {
            id: realmId,
            capital: point,
            color: new Color(),
            name: Random.choiceFrom(WORLD_NAMES)
        })
    }
    return realmMap
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint) {
        const {layers, rect, realmGrid, realmMap} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const isWater = layers.surface.isWater(wrappedPoint)
        // negative numbers on realmGrid are water tiles.
        // offset id to avoid index 0
        const realmId = fill.id + 1
        realmGrid.set(wrappedPoint, isWater ? -realmId : realmId)
        // create a realm object
        realmMap.set(realmId, {
            id: realmId,
            capital: wrappedPoint,
            color: new Color(),
            name: Random.choiceFrom(WORLD_NAMES)
        })
    }

    onFill(fill, fillPoint) {
        const {layers, rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const isWater = layers.surface.isWater(wrappedPoint)
        // negative numbers on realmGrid are water tiles.
        // offset id to avoid index 0
        const realmId = fill.id + 1
        realmGrid.set(wrappedPoint, isWater ? -realmId : realmId)
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
