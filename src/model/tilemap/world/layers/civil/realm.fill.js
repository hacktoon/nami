import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { WORLD_NAMES } from '/src/lib/names'
import { Capital } from './data'



const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const EMPTY = 0  // make fill basins grow bigger than others


export function buildRealms(context) {
    const fill = new RealmFill()
    const origins = []
    const realmGrid = Grid.fromRect(context.rect, () => EMPTY)
    context.cityMap.forEach((point, city) => {
        if (city.type == Capital.id)
            origins.push(point)
    })
    fill.start(origins, {realmGrid, ...context})
    return realmGrid
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return fill.id % 2 ? GROWTH : Math.floor(GROWTH / 2) }

    onInitFill(fill, fillPoint) {
        const {
            layers, rect, realmGrid, realmMap
        } = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const isWater = layers.surface.isWater(wrappedPoint)
        // negative numbers on realmGrid are water tiles.
        // offset id to avoid index 0
        const realmId = fill.id + 1
        const id = isWater ? -realmId : realmId
        // create a realm object
        realmGrid.set(wrappedPoint, id)
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
