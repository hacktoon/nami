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


export function buildCityMap(context) {
    const {cityPoints} = context
    const cityMap = new Map()
    let id = 0
    for (let point of cityPoints.points) {
        // common operations for all cities
        const color = new Color()
        cityMap.set(id, {id, color, point})
        id++
    }
    // for each capital, start a fill to get realms
    // const realmFill = new RealmSpacesFill()
    return cityMap
}


export function buildCitySpaces(context) {
    const {rect, cityPoints} = context
    const directionMaskGrid = new DirectionMaskGrid(rect)
    const cityGrid = Grid.fromRect(rect, () => EMPTY)
    const wildernessGrid = Grid.fromRect(rect, () => EMPTY)
    const fillDirectionGrid = Grid.fromRect(rect, () => EMPTY)
    const cityGraph = new Graph()
    const fillContext = {
        ...context,
        cityGrid,
        cityGraph,
        wildernessGrid,
        directionMaskGrid,
        fillDirectionGrid
    }
    const spacesFill = new CitySpacesFill()
    spacesFill.start(cityPoints.points, fillContext)
    return {
        cityGrid,
        graph: cityGraph,
        wildernessGrid,
        directionMaskGrid
    }
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
        const {cityGrid, wildernessGrid} = fill.context
        cityGrid.wrapSet(fillPoint, fill.id)
        wildernessGrid.wrapSet(fillPoint, fill.level)
    }

    canFill(fill, fillPoint) {
        const {cityGrid, layers} = fill.context
        const id = cityGrid.wrapGet(fillPoint)
        const isLake = layers.surface.isLake(fillPoint)
        return ! isLake && id === EMPTY
    }

    onFill(fill, fillPoint, parentPoint) {
        const {cityGrid, wildernessGrid, fillDirectionGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        // this fill point comes from a direction
        fillDirectionGrid.set(fillPoint, direction)
        cityGrid.wrapSet(fillPoint, fill.id)
        wildernessGrid.wrapSet(fillPoint, fill.level)
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
        const parentOrigin = cityMap.get(parentFillId).point

        // TODO: move to another function, save points on pointMap

        // create road points, send origin, target and previous point
        this.#buildCityRoute(fill, blockedPoint, blockedOrigin, parentPoint)
        this.#buildCityRoute(fill, parentPoint, parentOrigin, blockedPoint)
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
