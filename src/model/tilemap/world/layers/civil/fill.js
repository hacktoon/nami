import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'
import {
    Capital,
    Town,
    Village
} from './data'


const CITY_RATIO = .08
const VILLAGE_RATIO = .2
const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const EMPTY = 0  // make fill basins grow bigger than others


export function buildCityMap(rect, layers, realmCount) {
    const cityMap = new PointMap()
    const candidates = buildCityCandidates(rect, layers)
    let cityCount = 0
    let capitalCount = 0
    while (candidates.size > 0) {
        const cityPoint = candidates.random()
        // remove candidate points in a circle area
        const radius = Math.floor(rect.width * CITY_RATIO)
        Point.insideCircle(cityPoint, radius, point => {
            candidates.delete(rect.wrap(point))
        })
        const city = buildCity(realmCount, capitalCount, cityCount)
        cityMap.set(cityPoint, city)
        capitalCount++
        cityCount++
    }
    return cityMap
}


function buildCity(realmCount, capitalCount, cityId) {
    // define city type
    let type = Town
    if (realmCount > capitalCount) {
        type = Capital
    } else if (Random.chance(VILLAGE_RATIO)) {
        type = Village
    }
    return {
        id: cityId,
        name: Random.choiceFrom(WORLD_NAMES),
        type: type.id,
    }
}


function buildCityCandidates(rect, layers) {
    const candidates = new PointArraySet()
    // discover candidate cities in world grid
    Grid.fromRect(rect, point => {
        const isLand = layers.surface.isLand(point)
        const isBorder = layers.surface.isBorder(point)
        const isRiver = layers.river.has(point)
        if (isLand && (isRiver || isBorder)) {
            candidates.add(point)
        }
    })
    return candidates
}


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
        const realmId = fill.id + 1  // offset to avoid index 0
        const isWater = layers.surface.isWater(wrappedPoint)
        // code -x for water, +x for land
        const id = isWater ? -realmId : realmId
        realmGrid.set(wrappedPoint, id)
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
