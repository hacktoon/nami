import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Graph } from '/src/lib/graph'

import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'


const EMPTY = null


export function buildRouteMap(context) {
    // used in block fill to detect other's fill id
    const {rect, capitalPoints, cityPoints} = context
    const fillIdGrid = Grid.fromRect(rect, () => EMPTY)
    // save fill directions of each origin (city) for route building
    const fillDirectionGrid = Grid.fromRect(rect, () => EMPTY)
    const directionMaskGrid = new DirectionMaskGrid(rect)
    // used for road endpoints tracking
    const roadCityGraph = new Graph()
    // maps a fill id to a city point
    const fillOriginMap = new Map()
    const roadContext = {
        ...context,
        roadCityGraph,
        fillDirectionGrid,
        directionMaskGrid,
        fillOriginMap,
        fillIdGrid,
    }
    const fill = new RoadFill()
    const origins = [...capitalPoints, ...cityPoints]
    fill.start(origins, roadContext)
    return directionMaskGrid
}


class RoadFill extends ConcurrentFill {
    getChance(fill) {
        return .2
    }

    getGrowth(fill) {
        return 10
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {fillOriginMap, fillIdGrid} = fill.context
        // map the fill to the city point
        fillOriginMap.set(fill.id, fillPoint)
        fillIdGrid.set(fillPoint, fill.id)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {fillDirectionGrid, fillIdGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        fillDirectionGrid.set(fillPoint, direction)
        fillIdGrid.set(fillPoint, fill.id)
    }

    canFill(fill, fillPoint) {
        const {layers, fillIdGrid} = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const isEmpty = fillIdGrid.get(fillPoint) === EMPTY
        return isLand && isEmpty
    }

    onBlockedFill(fill, blockedPoint, referencePoint) {
        // when two fills block each other, a road is built between them
        const { fillIdGrid, fillOriginMap, roadCityGraph } = fill.context
        const blockedFillId = fillIdGrid.get(blockedPoint)
        const referenceFillId = fillIdGrid.get(referencePoint)
        const isSameFill = blockedFillId === referenceFillId
        // check if there is already a road between the cities
        const hasRoad = roadCityGraph.hasEdge(blockedFillId, referenceFillId)
        // return on first fill block. points are on shortest distance
        if (blockedFillId === EMPTY || isSameFill || hasRoad) return
        // set road as an edge between blocked and reference fill ids
        roadCityGraph.setEdge(blockedFillId, referenceFillId)
        // get cities points - the targets of the road
        const blockedOrigin = fillOriginMap.get(blockedFillId)
        const referenceOrigin = fillOriginMap.get(referenceFillId)
        // create road points, send origin, target and previous point
        this.#buildCityRoute(fill, blockedPoint, blockedOrigin, referencePoint)
        this.#buildCityRoute(fill, referencePoint, referenceOrigin, blockedPoint)
    }

    #buildCityRoute(fill, origin, target, initialPrevPoint) {
        // Builds a route from the middle of the road to the city point.
        const {rect, fillDirectionGrid, directionMaskGrid} = fill.context
        const points = [origin]
        let nextPoint = origin
        let prevPoint = initialPrevPoint
        // compare the next point in real grid space with the target
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
