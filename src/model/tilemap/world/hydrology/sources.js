import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'


const LAKE_CHANCE = .05


/*
    The water source fill starts from land borders and detects
    if a point is a river source or a lake.
*/
export function buildWaterSourceMap(context) {
    const visitedPoints = new PointSet()
    const fill = new WaterSourceFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, {...context, lakeId: 0, visitedPoints})
}


class WaterSourceFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        const context = fill.context
        const wrappedPoint = context.rect.wrap(parentPoint)
        const adjacents = Point.adjacents(wrappedPoint)
        if (isRiverSource(context, wrappedPoint)) {
            context.riverSources.add(wrappedPoint)
        }
        if (isLake(context, wrappedPoint)) {
            context.lakePoints.set(wrappedPoint, context.lakeId++)
        }
        return adjacents
    }

    canFill(fill, fillPoint) {
        const {rect, visitedPoints, surfaceLayer} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const isLand = surfaceLayer.isLand(wrappedFillPoint)
        return isLand && ! visitedPoints.has(wrappedFillPoint)
    }

    onFill(fill, fillPoint) {
        const {rect, visitedPoints} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        visitedPoints.add(wrappedFillPoint)
    }
}


function isRiverSource(context, point) {
    let totalFlowsReceived = 0
    for(let neighbor of Point.adjacents(point)) {
        const isNeighborLand = context.surfaceLayer.isLand(neighbor)
        // test if any land neighbors flows to point
        if (isNeighborLand && flowsTo(context, neighbor, point)) {
            totalFlowsReceived++
        }
    }
    // it's a river source if receives enough rain and no erosion flows
    const hasEnoughRain = context.rainLayer.createsRivers(point)
    return hasEnoughRain && totalFlowsReceived == 0
}


function isLake(context, point) {
    return Random.chance(LAKE_CHANCE)
}


function flowsTo(context, originPoint, fillPoint) {
    // checks if originPoint flow points to fillPoint
    const origin = context.rect.wrap(originPoint)
    const erosion = context.erosionLayer.get(origin)
    const pointAtDirection = Point.atDirection(originPoint, erosion.flow)
    return Point.equals(fillPoint, pointAtDirection)
}
