import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Graph } from '/src/lib/graph'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'


const CITY_RADIUS = .03
const TOWN_RATIO = .6

// fill constants
const CHANCE = .1  // chance of fill growing
const GROWTH = 5  // make fill basins grow bigger than others
const EMPTY = null


export function buildCityPoints(context) {
    const {rect, layers} = context
    const points = []
    const candidates = buildCityCandidates(rect, layers)
    while (candidates.size > 0) {
        const candidatePoint = candidates.random() // get a random candidate
        // min radius value is 1
        const radius = Math.max(Math.floor(rect.width * CITY_RADIUS), 1)
        // remove all candidate points in a circle area
        Point.insideCircle(candidatePoint, radius, inRadiusPoint => {
            candidates.delete(rect.wrap(inRadiusPoint))
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


export function buildCityMap(context) {
    const {realmCount, cityPoints} = context
    const cityMap = new Map()
    let capitalCount = 0
    let cityCount = 0
    let type
    for (let point of cityPoints) {
        if (realmCount > capitalCount) {
            type = Capital
            capitalCount++
        } else {
            type = Random.chance(TOWN_RATIO) ? Town : Village
        }
        const city = buildCity(cityCount, type)
        cityMap.set(cityCount, city)
        cityCount++
    }
    return cityMap
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


export function buildCitySpaces(context) {
    const fill = new CityGridFill()
    const cityGrid = Grid.fromRect(context.rect, () => EMPTY)
    fill.start(context.cityPoints, {...context, cityGrid})
    return cityGrid
}


class CityGridFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint) {
        const {cityGrid} = fill.context
        // negative for actual city point
        cityGrid.wrapSet(fillPoint, -fill.id)
    }

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
