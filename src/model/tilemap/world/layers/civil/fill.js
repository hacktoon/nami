import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { PointSet, PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'


const CITY_RATIO = .08
const CHANCE = .1  // chance of fill growing
const GROWTH = 15  // make fill basins grow bigger than others
const EMPTY = 0  // make fill basins grow bigger than others


export function buildCities(rect, layers) {
    const candidates = new PointArraySet()
    const cityPoints = new PointSet()
    Grid.fromRect(rect, point => {
        const isLand = layers.surface.isLand(point)
        const isBorder = layers.surface.isBorder(point)
        const isRiver = layers.river.has(point)
        if (isLand && (isRiver || isBorder)) {
            candidates.add(point)
        }
    })
    while (candidates.size > 0) {
        const center = candidates.random()
        // remove candidate points in a circle area
        const radius = Math.floor(rect.width * CITY_RATIO)
        Point.insideCircle(center, radius, point => {
            candidates.delete(rect.wrap(point))
        })
        cityPoints.add(center)
    }
    return cityPoints
}



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
    getGrowth(fill) { return fill.id % 2 ? GROWTH : Math.floor(GROWTH / 2) }

    onInitFill(fill, fillPoint) {
        const {
            layers, rect, realmGrid, realmMap
        } = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const idCount = fill.id + 1  // offset to avoid index 0
        const isWater = layers.surface.isWater(wrappedPoint)
        const id = isWater ? -idCount : idCount
        realmGrid.set(wrappedPoint, id)
        // create a realm object
        realmMap.set(idCount, {
            id,
            color: new Color(),
            name: Random.choiceFrom(WORLD_NAMES)
        })
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
