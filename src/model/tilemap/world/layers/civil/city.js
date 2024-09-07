import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Graph } from '/src/lib/graph'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { Direction } from '/src/lib/direction'
import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'


const CITY_BORDER_CHANCE = .4
const CITY_CHANCE = .3

// fill constants
const CHANCE = .1  // chance of fill growing
const GROWTH = 2  // make fill grow bigger than others
const EMPTY = null


export function buildCityPoints(context) {
    const {rect, layers} = context
    // eliminate city points too close of already chosen
    const cityPoints = new PointSet(rect)
    // create city id grid
    Grid.fromRect(rect, point => {
        if (layers.surface.isWater(point)) return
        const borderCityChance = Random.chance(CITY_BORDER_CHANCE)
        const isBorder = layers.surface.isBorder(point) && borderCityChance
        const isRiver = layers.river.has(point) && Random.chance(CITY_CHANCE)
        // avoid too close cities
        const isEvenFilter = (point[0] + point[1]) % 2 == 0
        if ((isRiver || isBorder) && isEvenFilter) {
            cityPoints.add(point)
        }
    })
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
    const routeMaskGrid = new DirectionMaskGrid(rect)
    const cityGrid = Grid.fromRect(rect, () => EMPTY)
    const wildernessGrid = Grid.fromRect(rect, () => EMPTY)
    const fillDirectionGrid = Grid.fromRect(rect, () => EMPTY)
    const cityGraph = new Graph()
    const fillContext = {
        ...context,
        cityGrid,
        cityGraph,
        wildernessGrid,
        routeMaskGrid,
        fillDirectionGrid
    }
    const fillMap = new Map(cityPoints.points.map((origin, id) => {
        return [id, {origin}]
    }))
    new CitySpacesFill(fillMap, fillContext).complete()
    return {
        cityGrid,
        graph: cityGraph,
        wildernessGrid,
        routeMaskGrid
    }
}


class CitySpacesFill extends ConcurrentFill {
    // this fill marks the city ids grid
    // and sets the city neighborhood graph
    // along with routes
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        const isWater = fill.context.layers.surface.isWater(parentPoint)
        return isWater ? Point.around(parentPoint) : Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {cityGrid, wildernessGrid} = fill.context
        cityGrid.wrapSet(fillPoint, fill.id)
        wildernessGrid.wrapSet(fillPoint, fill.level)
    }

    isEmpty(fill, fillPoint) {
        const {cityGrid} = fill.context
        const id = cityGrid.wrapGet(fillPoint)
        return id === EMPTY
    }

    notEmpty(fill, fillPoint, source) {
        // when two fills block each other, a road is built between them
        const { layers, cityGrid, cityGraph, cityMap } = fill.context
        const blockedFillId = cityGrid.wrapGet(fillPoint)
        const parentFillId = cityGrid.wrapGet(source)
        // blocked fills are the same type, ignore
        if (blockedFillId == parentFillId) return
        // this "city to city" road has already been created, ignore
        if (cityGraph.hasEdge(blockedFillId, parentFillId)) return
        // only fill graph if there's a claimed city on blocked point
        // set road as an edge between blocked and reference fill ids
        cityGraph.setEdge(blockedFillId, parentFillId)
        // get cities points - the targets of the road
        const blockedOrigin = cityMap.get(blockedFillId).point
        const parentOrigin = cityMap.get(parentFillId).point
        // TODO: move to another function, save points on pointMap
        // create road points, send origin, fillPoint and previous point
        this.#buildCityRoute(fill, fillPoint, blockedOrigin, source)
        this.#buildCityRoute(fill, source, parentOrigin, fillPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {cityGrid, wildernessGrid, fillDirectionGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        // this fill point comes from a direction
        fillDirectionGrid.set(fillPoint, direction)
        cityGrid.wrapSet(fillPoint, fill.id)
        wildernessGrid.wrapSet(fillPoint, fill.level)
    }

    #buildCityRoute(fill, origin, target, initialPrevPoint) {
        // Builds a route from the middle of the road to the city point.
        const {rect, fillDirectionGrid, routeMaskGrid} = fill.context
        const points = [origin]
        let nextPoint = origin
        let prevPoint = initialPrevPoint
        let prevDirection = Point.directionBetween(nextPoint, prevPoint)
        // compare the next point in wrapped grid space with the target
        while (Point.differs(rect.wrap(nextPoint), target)) {
            const direction = fillDirectionGrid.get(nextPoint)
            // set road at forward and previous direction
            routeMaskGrid.add(nextPoint, direction)
            routeMaskGrid.add(nextPoint, prevDirection)
            // update the previous point to follow the road
            prevPoint = nextPoint
            // the next point is at <direction> of current point
            nextPoint = Point.atDirection(nextPoint, direction)
            prevDirection = Point.directionBetween(nextPoint, prevPoint)
            // points.push(nextPoint)
        }
        // add route direction to grid mask
        routeMaskGrid.add(target, prevDirection)
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
