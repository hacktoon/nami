import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Graph } from '/src/lib/graph'
import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'
import { Color } from '/src/lib/color'
import { Random } from '/src/lib/random'
import { DirectionBitMaskGrid } from '/src/model/tilemap/lib/bitmask'


const CITY_CHANCE = .5

// fill constants
const CHANCE = .1  // chance of fill growing
const GROWTH = 2  // make fill grow bigger than others
const EMPTY = null


export function buildCityPoints(context) {
    const {rect, world} = context
    // eliminate city points too close of already chosen
    const cityPoints = new PointSet(rect)
    // create city id grid
    Grid.fromRect(rect, point => {
        if (world.surface.isWater(point))
            return
        const isBorder = world.surface.isBorder(point)
        const isRiver = world.river.has(point)
        // avoid cities which are too close to each other
        const isEvenFilter = (point[0] + point[1]) % 2 == 0
        const isCity = isEvenFilter && (isRiver || isBorder)
        if (isCity && Random.chance(CITY_CHANCE)) {
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
    const routeMaskGrid = new DirectionBitMaskGrid(rect)
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
    // city will be identified by numeric id
    const fillMap = new Map(cityPoints.points.map((origin, id) => {
        return [id, {origin}]
    }))
    new CityAreaFill(fillMap, fillContext).complete()
    return {
        cityGrid,
        graph: cityGraph,
        wildernessGrid,
        routeMaskGrid
    }
}


class CityAreaFill extends ConcurrentFill {
    // this fills the city id grid
    // and sets the city neighborhood graph
    // along with routes
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        const {world} = fill.context
        const isOrigin = Point.equals(parentPoint, fill.origin)
        if (isOrigin || world.surface.isBorder(parentPoint)) {
            return Point.adjacents(parentPoint)
        }
        return Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {chunkRect, cityGrid, wildernessGrid, midpointIndexGrid} = fill.context
        cityGrid.wrapSet(fillPoint, fill.id)
        wildernessGrid.wrapSet(fillPoint, fill.level)
        midpointIndexGrid.wrapSet(fillPoint, buildMidpointIndex(chunkRect))
    }

    isEmpty(fill, fillPoint) {
        return EMPTY === fill.context.cityGrid.wrapGet(fillPoint)
    }

    notEmpty(fill, fillPoint, source) {
        // when two fills block each other, a road is built between them
        // going back to each city point
        const {cityGrid, cityGraph, cityMap} = fill.context
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
        const {
            rect, chunkRect, fillDirectionGrid, routeMaskGrid, midpointIndexGrid
        } = fill.context
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
            // set midpoint
            midpointIndexGrid.wrapSet(nextPoint, buildMidpointIndex(chunkRect))
            // update the previous point to follow the road
            prevPoint = nextPoint
            // the next point is at <direction> of current point
            nextPoint = Point.atDirection(nextPoint, direction)
            prevDirection = Point.directionBetween(nextPoint, prevPoint)
            // points.push(nextPoint)
        }
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


const ZONE_OFFSET_RANGE = [0, 3]

function buildMidpointIndex(chunkRect) {
    const offsetX = Random.int(...ZONE_OFFSET_RANGE) * Random.choice(1, -1)
    const offsetY = Random.int(...ZONE_OFFSET_RANGE) * Random.choice(1, -1)
    const middle = Math.round(chunkRect.width / 2)
    const midpoint = [middle + offsetX, middle + offsetY]
    return chunkRect.pointToIndex(midpoint)
}
