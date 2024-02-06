import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const EMPTY = 0


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


export function buildRealmGrid(context) {
    const fill = new RealmFill()
    const realmGrid = Grid.fromRect(context.rect, () => EMPTY)
    // start fill from capitals to define realms territory
    const realmIds = context.capitalPoints.map((point, index) => {
        // negative numbers on realmGrid are water tiles.
        // offset id to avoid index 0
        const realmId = index + 1
        // create a realm object
        context.realmMap.set(realmId, {
            id: realmId,
            capital: point,
            color: new Color(),
            name: Random.choiceFrom(WORLD_NAMES)
        })
        return realmId
    })
    fill.start(context.capitalPoints, {realmIds, realmGrid, ...context})
    return realmGrid
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onFill(fill, fillPoint) {
        const {layers, rect, realmIds, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const isWater = layers.surface.isWater(wrappedPoint)
        // negative numbers on realmGrid are water tiles.
        // offset id to avoid index 0
        const realmId = realmIds[fill.id]
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
