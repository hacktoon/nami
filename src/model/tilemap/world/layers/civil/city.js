import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'
import { Capital, Town, Village } from './data'


const CITY_RATIO = .06
const TOWN_RATIO = .6


export function buildCityPoints(rect, layers, realmCount) {
    const cities = []
    const capitals = []
    const candidates = buildCityCandidates(rect, layers)
    let capitalCount = 0
    while (candidates.size > 0) {
        const point = candidates.random()
        // remove candidate points in a circle area
        const radius = Math.floor(rect.width * CITY_RATIO)
        Point.insideCircle(point, radius, point => {
            candidates.delete(rect.wrap(point))
        })
        // add capital point
        if (realmCount > capitalCount) {
            capitals.push(point)
            capitalCount++
        } else {
            cities.push(point)
        }
    }
    return [cities, capitals]
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


export function buildCityMap(capitalPoints, cityPoints) {
    const cityMap = new PointMap()
    let cityCount = 0
    for (let point of capitalPoints) {
        const type = Capital
        cityMap.set(point, buildCity(cityCount, type))
        cityCount++
    }
    for (let point of cityPoints) {
        const type = Random.chance(TOWN_RATIO) ? Town : Village
        cityMap.set(point, buildCity(cityCount, type))
        cityCount++
    }
    return cityMap
}


function buildCity(cityId, type) {
    return {
        id: cityId,
        type: type.id,
        name: Random.choiceFrom(WORLD_NAMES),
        population: Random.int(...type.populationRange),
    }
}
