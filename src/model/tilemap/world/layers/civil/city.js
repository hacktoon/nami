import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'


const CITY_RADIUS = .04
const TOWN_RATIO = .6

// fill constants
const CHANCE = .1  // chance of fill growing
const GROWTH = 5  // make fill basins grow bigger than others
const EMPTY = 0


export function buildCityGrid(context) {
    const fill = new CityTerritoryFill()
    const originPoints = [...context.capitalPoints, ...context.cityPoints]
    const cityGrid = Grid.fromRect(context.rect, () => EMPTY)
    fill.start(originPoints, {...context, cityGrid})
    return cityGrid
}


export function buildCityMap(context) {
    const {rect, layers, realmCount} = context
    const points = buildCityPoints(context)
    const cityMap = new PointMap()
    const idMap = new Map()
    const capitalPoints = []
    const cityPoints = []
    let capitalCount = 0
    let cityCount = 0
    let type
    for (let point of points) {
        if (realmCount > capitalCount) {
            type = Capital
            capitalPoints.push(point)
            capitalCount++
        } else {
            type = Random.chance(TOWN_RATIO) ? Town : Village
            cityPoints.push(point)
        }
        const city = buildCity(cityCount, type)
        cityMap.set(point, city)
        idMap.set(cityCount, city)
        cityCount++
    }
    return [cityMap, cityPoints, capitalPoints]
}


function buildCityPoints(context) {
    const {rect, layers} = context
    const points = []
    const candidates = buildCityCandidates(rect, layers)
    while (candidates.size > 0) {
        const candidatePoint = candidates.random()
        // remove candidate points in a circle area
        const radius = Math.floor(rect.width * CITY_RADIUS)
        Point.insideCircle(candidatePoint, radius, candidatePoint => {
            candidates.delete(rect.wrap(candidatePoint))
        })
        points.push(candidatePoint)
    }
    return points
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


function buildCity(cityId, type) {
    return {
        id: cityId,
        type: type.id,
        name: Random.choiceFrom(WORLD_NAMES),
        color: new Color(),
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
    static exits = 4
}


export class Town extends City {
    static id = 1
    static name = 'Town'
    static exits = 3
}


export class Village extends City {
    static id = 2
    static name = 'Village'
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
        const {cityGrid} = fill.context
        cityGrid.wrapSet(fillPoint, fill.id)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {cityGrid} = fill.context
        return cityGrid.wrapGet(fillPoint) === EMPTY
    }
}
