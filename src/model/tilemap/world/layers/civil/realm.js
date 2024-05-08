import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const EMPTY = 0


export function buildRealmMap(capitalPoints) {
    const realmMap = new Map()
    capitalPoints.points.forEach((point, index) => {
        // start realm id from 1
        const realmId = index + 1
        realmMap.set(realmId, {
            id: realmId,
            capital: point,
            color: new Color(),
            name: Random.choiceFrom(WORLD_NAMES)
        })
    })
    return realmMap
}


export function buildRealmGrid(context) {
    const realmGrid = Grid.fromRect(context.rect, () => EMPTY)
    // start fill from capitals to define realms territory
    const fill = new RealmFill()
    fill.start(context.capitalPoints, {realmGrid, ...context})
    return realmGrid
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onFill(fill, fillPoint) {
        const {layers, rect, realmGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const isWater = layers.surface.isWater(wrappedPoint)
        const realmId = fill.id + 1
        // negative numbers on realmGrid are water tiles.
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
