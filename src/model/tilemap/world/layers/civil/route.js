import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Graph } from '/src/lib/graph'

import { DirectionMaskGrid } from '/src/model/tilemap/lib/bitmask'


const EMPTY = null


export function buildRouteMap(context) {
    // used in block fill to detect other's fill id
    const {capitalPoints, cityPoints} = context
    const fillIdGrid = Grid.fromRect(context.rect, () => EMPTY)
    // save fill directions of each origin (city) for route building
    const fillDirectionGrid = Grid.fromRect(context.rect, () => EMPTY)
    const directionMaskGrid = new DirectionMaskGrid(context.rect)
    // used for road endpoints tracking
    const roadCityGraph = new Graph()
    // maps a fill id to a city point
    const fillOriginMap = new Map()
    const roadContext = {
        roadCityGraph,
        fillDirectionGrid,
        directionMaskGrid,
        fillOriginMap,
        fillIdGrid,
        ...context
    }
    const fill = new RoadFill()
    const origins = [...capitalPoints, ...cityPoints]
    fill.start(origins, roadContext)
    return [directionMaskGrid, fillDirectionGrid]
}


class RoadFill extends ConcurrentFill {
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

    onBlockedFill(fill, fillPoint, parentPoint) {
        const { fillIdGrid, fillOriginMap, roadCityGraph,
            fillDirectionGrid
        } = fill.context
        const blockedFillId = fillIdGrid.get(fillPoint)
        const parentFillId = fillIdGrid.get(parentPoint)
        const isSameFill = blockedFillId === parentFillId
        const hasRoad = roadCityGraph.hasEdge(blockedFillId, parentFillId)
        // return on first fill block. points are on shortest distance
        if (blockedFillId === EMPTY || isSameFill || hasRoad) return
        // set road as an edge between the blocked fill and the parent fill
        roadCityGraph.setEdge(blockedFillId, parentFillId)
        // get cities points - the targets of the road
        const fillTarget = fillOriginMap.get(blockedFillId)
        const parentTarget = fillOriginMap.get(parentFillId)
        if (Point.equals(fillPoint, [50,0])) {
            // console.log(
            //     fillDirectionGrid.get([50, 0]),
            //     fillDirectionGrid.get([50, 99]),
            //     fillDirectionGrid.get([49, 99]),
            // );
            // console.log(`${fillPoint} ${parentPoint}`);
        }
        // create road points, send origin, target and previous point
        this.#buildRouteToCity(fill, fillPoint, fillTarget, parentPoint)
        // this.#buildRouteToCity(fill, parentPoint, parentTarget, fillPoint)
    }

    #buildRouteToCity(fill, origin, target, initialPrevPoint) {
        // Builds a route from the middle of the road to the city point.
        const {rect, fillDirectionGrid, directionMaskGrid} = fill.context
        const points = [origin]
        let nextPoint = origin
        let prevPoint = initialPrevPoint
        while (Point.differs(nextPoint, target)) {
            const direction = fillDirectionGrid.get(nextPoint)
            const prevDirection = Point.directionBetween(nextPoint, prevPoint)

            // set road at forward and previous direction
            directionMaskGrid.add(nextPoint, direction)
            directionMaskGrid.add(nextPoint, prevDirection)
            // update the previous point to follow the road
            prevPoint = nextPoint
            // the next point is at <direction> of current point
            nextPoint = rect.wrap(Point.atDirection(nextPoint, direction))
            // points.push(nextPoint)
        }
        return points
    }

}
