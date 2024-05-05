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
const CHANCE = .2  // chance of fill growing
const GROWTH = 1  // make fill grow bigger than others
const EMPTY = null


export function buildCityPoints(context) {
    const {rect, layers} = context
    const candidates = new PointArraySet()
    // discover candidate cities in world grid
    // create city id grid
    Grid.fromRect(rect, point => {
        if (layers.surface.isWater(point)) return
        if (! layers.surface.isBorder(point)) return
        if (! layers.river.has(point)) return
        candidates.add(point)
    })
    // eliminate city points too close of already chosen
    const cityPoints = []
    while (candidates.size > 0) {
        const candidatePoint = candidates.random() // get a random candidate
        // min radius value is 1
        const radius = Math.max(Math.floor(rect.width * CITY_RADIUS), 1)
        // remove all candidate points in a circle area
        Point.insideCircle(candidatePoint, radius, inRadiusPoint => {
            // radius can overflow grid, wrap the point
            candidates.delete(rect.wrap(inRadiusPoint))
        })
        cityPoints.push(candidatePoint)
    }
    return cityPoints
}


export function buildCityRealms(context) {
    const {realmCount, cityPoints} = context
    const cityMap = new Map()
    const realmMap = new Map()
    const capitalPoints = []
    let realmId = 0
    let cityId = 1
    let type
    for (let point of cityPoints) {
        if (realmCount > realmId) {
            type = Capital
            capitalPoints.push(point)
            realmMap.set(realmId, {id: realmId, point})
            realmId++
        } else {
            type = Random.chance(TOWN_RATIO) ? Town : Village
        }
        // common operations for all cities
        const city = buildCity(cityId, point, type)
        cityMap.set(cityId, city)
        cityId++
    }
    // for each capital, start a fill to get realms
    // const realmFill = new RealmSpacesFill()
    return [cityMap, capitalPoints]
}


function buildCity(cityId, point, type) {
    return {
        id: cityId,
        type: type.id,
        name: Random.choiceFrom(WORLD_NAMES),
        color: new Color(),
        point,
    }
}


export function buildCitySpaces(context) {
    const citySpacesFill = new CitySpacesFill()
    const {rect, cityPoints} = context
    const cityGraph = new Graph()
    const cityGrid = Grid.fromRect(rect, () => EMPTY)
    const civilLevelGrid = Grid.fromRect(rect, () => EMPTY)
    // maps a fill id to a city point
    citySpacesFill.start(cityPoints, {
        ...context,
        cityGrid,
        cityGraph,
        civilLevelGrid,
    })
    return [cityGrid, cityGraph, civilLevelGrid]
}


class CitySpacesFill extends ConcurrentFill {
    // this fill marks the city ids grid
    // and sets the city neighborhood graph
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {cityGrid, civilLevelGrid} = fill.context
        // avoid zero index, shift values
        const id = fill.id + 1
        // negative for actual origin city point
        cityGrid.wrapSet(fillPoint, -id)
        civilLevelGrid.wrapSet(fillPoint, fill.level)
    }

    canFill(fill, fillPoint) {
        const currentValue = fill.context.cityGrid.wrapGet(fillPoint)
        return currentValue === EMPTY
    }

    onFill(fill, fillPoint) {
        const {cityGrid, civilLevelGrid} = fill.context
        // avoid zero index
        const id = fill.id + 1
        civilLevelGrid.wrapSet(fillPoint, fill.level)
        cityGrid.wrapSet(fillPoint, id)
    }

    onBlockedFill(fill, blockedPoint, referencePoint) {
        // when two fills block each other, a road is built between them
        const { cityGrid, cityGraph } = fill.context
        const blockedFillId = Math.abs(cityGrid.wrapGet(blockedPoint))
        const referenceFillId = Math.abs(cityGrid.wrapGet(referencePoint))
        // set road as an edge between blocked and reference fill ids
        cityGraph.setEdge(blockedFillId, referenceFillId)
    }
}



class RealmSpacesFill extends ConcurrentFill {
    // this fill marks the city ids grid
    // and sets the city neighborhood graph
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint) {
        // negative for actual origin city point
        fill.context.cityMap.get(fillPoint)
    }

    onFill(fill, fillPoint) {
        fill.context.cityGrid.wrapSet(fillPoint, fill.id)
    }

    onBlockedFill(fill, neighbor) {
        // encountered another city fill, set them as neighbors
        const {cityGrid, cityGraph} = fill.context
        const neighborCityId = Math.abs(cityGrid.get(neighbor))
        cityGraph.setEdge(fill.id, neighborCityId)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const currentValue = fill.context.cityGrid.wrapGet(fillPoint)
        return currentValue === EMPTY
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
