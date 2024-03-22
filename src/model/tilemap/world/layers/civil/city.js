import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'


const CITY_RATIO = .06
const TOWN_RATIO = .6


export function buildCityPoints(rect, layers, realmCount) {
    const cities = []
    const capitals = []
    const candidates = buildCityCandidates(rect, layers)
    let capitalCount = 0
    while (candidates.size > 0) {
        const candidatePoint = candidates.random()
        // remove candidate points in a circle area
        const radius = Math.floor(rect.width * CITY_RATIO)
        Point.insideCircle(candidatePoint, radius, candidatePoint => {
            candidates.delete(rect.wrap(candidatePoint))
        })
        // add capital candidatePoint
        if (realmCount > capitalCount) {
            capitals.push(candidatePoint)
            capitalCount++
        } else {
            cities.push(candidatePoint)
        }
    }
    return [cities, capitals]
}


function buildCityCandidates(rect, layers) {
    const candidates = new PointArraySet()
    // discover candidate cities in world grid
    Grid.fromRect(rect, point => {
        if (layers.surface.isWater(point)) return
        if (! layers.surface.isBorder(point)) return
        if (! layers.river.has(point)) return
        candidates.add(point)
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


export class City {
    static parse(id) {
        return TYPE_MAP[id]
    }
}


export class Capital extends City {
    static id = 0
    static name = 'Capital'
    static populationRange = [2001, 5000]
    static exits = 4
}


export class Town extends City {
    static id = 1
    static name = 'Town'
    static populationRange = [201, 2000]
    static exits = 3
}


export class Village extends City {
    static id = 2
    static name = 'Village'
    static populationRange = [20, 200]
    static exits = 2
}


const TYPE_MAP = {
    0: Capital,
    1: Town,
    2: Village,
}



class CityTerritoryFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onFill(fill, fillPoint) {
        const {rect, cityGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        cityGrid.set(wrappedPoint, fill.id)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {rect, cityGrid} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        return cityGrid.get(wrappedPoint) === EMPTY
    }
}
