import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Graph } from '/src/lib/graph'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { PointArraySet } from '/src/lib/point/set'
import { WORLD_NAMES } from '/src/lib/names'
import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'


const CITY_RADIUS = .03
const TOWN_RATIO = .6

// fill constants
const CHANCE = .1  // chance of fill growing
const GROWTH = 2  // make fill grow bigger than others
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
    const cityPoints = new PointSet(rect)
    while (candidates.size > 0) {
        const candidatePoint = candidates.random() // get a random candidate
        // min radius value is 1
        const radius = Math.max(Math.floor(rect.width * CITY_RADIUS), 1)
        // remove all candidate points in a circle area
        Point.insideCircle(candidatePoint, radius, inRadiusPoint => {
            // radius can overflow grid, wrap the point
            candidates.delete(rect.wrap(inRadiusPoint))
        })
        cityPoints.add(candidatePoint)
    }
    return cityPoints
}


export function buildCityRealms(context) {
    const {realmCount, cityPoints} = context
    const cityMap = new Map()
    const realmMap = new Map()
    const capitalPoints = []
    let realmId = 0
    let cityId = 0
    let type
    for (let point of cityPoints.points) {
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
    const {rect, cityPoints} = context
    const continentSpacesFill = new ContinentSpacesFill()
    const oceanSpacesFill = new OceanSpacesFill()
    const directionMaskGrid = new DirectionMaskGrid(rect)
    const cityGrid = Grid.fromRect(rect, () => EMPTY)
    const levelGrid = Grid.fromRect(rect, () => EMPTY)
    const fillDirectionGrid = Grid.fromRect(rect, () => EMPTY)
    const cityGraph = new Graph()
    const fillContext = {
        ...context,
        cityGrid,
        cityGraph,
        levelGrid,
        directionMaskGrid,
        fillDirectionGrid
    }
    const origins = cityPoints.points
    continentSpacesFill.start(origins, fillContext)
    oceanSpacesFill.start(origins, fillContext)
    return {
        idGrid: cityGrid,
        graph: cityGraph,
        levelGrid: levelGrid,
        directionMaskGrid
    }
}


class CitySpacesFill extends ConcurrentFill {
    // this fill marks the city ids grid
    // and sets the city neighborhood graph
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onFill(fill, fillPoint, parentPoint) {
        const {cityGrid, levelGrid, fillDirectionGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        // this fill point comes from a direction
        fillDirectionGrid.set(fillPoint, direction)
        cityGrid.wrapSet(fillPoint, fill.id)
        levelGrid.wrapSet(fillPoint, fill.level)
    }

    onBlockedFill(fill, blockedPoint, parentPoint) {
        // when two fills block each other, a road is built between them
        const { cityGrid, cityGraph, cityMap } = fill.context
        const blockedFillId = cityGrid.wrapGet(blockedPoint)
        const parentFillId = cityGrid.wrapGet(parentPoint)
        // it's this fill testing itself, do nothing
        if (blockedFillId === parentFillId) return
        // this "city to city" road has already been created
        if (cityGraph.hasEdge(blockedFillId, parentFillId)) return
        // it has been blocked but it's still empty, avoid making roads
        if (blockedFillId === EMPTY) return
        // only fill graph if there's a claimed city on blocked point
        // set road as an edge between blocked and reference fill ids
        cityGraph.setEdge(blockedFillId, parentFillId)
        // get cities points - the targets of the road
        const blockedOrigin = cityMap.get(blockedFillId).point
        const referenceOrigin = cityMap.get(parentFillId).point
        // // create road points, send origin, target and previous point
        this.#buildCityRoute(fill, blockedPoint, blockedOrigin, parentPoint)
        this.#buildCityRoute(fill, parentPoint, referenceOrigin, blockedPoint)
    }

    #buildCityRoute(fill, origin, target, initialPrevPoint) {
        // Builds a route from the middle of the road to the city point.
        const {rect, fillDirectionGrid, directionMaskGrid} = fill.context
        const points = [origin]
        let nextPoint = origin
        let prevPoint = initialPrevPoint
        // compare the next point in unwrapped grid space with the target
        while (Point.differs(rect.wrap(nextPoint), target)) {
            const direction = fillDirectionGrid.get(nextPoint)
            const prevDirection = Point.directionBetween(nextPoint, prevPoint)
            // set road at forward and previous direction
            directionMaskGrid.add(nextPoint, direction)
            directionMaskGrid.add(nextPoint, prevDirection)
            // update the previous point to follow the road
            prevPoint = nextPoint
            // the next point is at <direction> of current point
            nextPoint = Point.atDirection(nextPoint, direction)
            // points.push(nextPoint)
        }
        return points
    }
}


class ContinentSpacesFill extends CitySpacesFill {
    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {cityGrid, levelGrid} = fill.context
        cityGrid.wrapSet(fillPoint, fill.id)
        levelGrid.wrapSet(fillPoint, fill.level)
    }

    canFill(fill, fillPoint) {
        const {cityGrid, layers} = fill.context
        const currentValue = cityGrid.wrapGet(fillPoint)
        const isLake = layers.surface.isLake(fillPoint)
        const isSea = layers.surface.isSea(fillPoint)
        const isLand = layers.surface.isLand(fillPoint)
        const isValid = isLand || isLake || isSea
        return currentValue === EMPTY && isValid
    }
}


class OceanSpacesFill extends CitySpacesFill {
    onInitFill(fill, fillPoint) {
        // do nothing on init, it's already claimed
    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {cityGrid, layers} = fill.context
        const currentValue = cityGrid.wrapGet(fillPoint)
        const isWater = layers.surface.isWater(fillPoint)
        const isIsland = layers.surface.isIsland(fillPoint)
        return currentValue === EMPTY && (isIsland || isWater)
    }
}


class RealmSpacesFill extends ConcurrentFill {
    // this fill marks the city ids grid
    // and sets the city neighborhood graph
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint) {
        fill.context.cityMap.get(fillPoint)
    }

    onFill(fill, fillPoint) {
        fill.context.cityGrid.wrapSet(fillPoint, fill.id)
    }

    onBlockedFill(fill, neighbor) {
        // encountered another city fill, set them as neighbors
        const {cityGrid, cityGraph} = fill.context
        const neighborCityId = cityGrid.get(neighbor)
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
