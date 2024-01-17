import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'
import {
    Capital,
    Town,
    Village
} from './data'


const CITY_RATIO = .06
const TOWN_RATIO = .6


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
        const city = buildCity(cityCount, realmCount, capitalCount)
        cityMap.set(cityPoint, city)
        capitalCount++
        cityCount++
    }
    return cityMap
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


function buildCity(cityId, realmCount, capitalCount) {
    let type = Village  // default value
    if (realmCount > capitalCount) {
        type = Capital
    } else if (Random.chance(TOWN_RATIO)) {
        type = Town
    }
    return {
        id: cityId,
        type: type.id,
        name: Random.choiceFrom(WORLD_NAMES),
        population: Random.int(...type.populationRange),
    }
}
