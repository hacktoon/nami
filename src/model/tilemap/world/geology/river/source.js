import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'


/*
    The survey fill starts from land borders and detects
    if a point is a river source or river mouth.
    It can be used to detect lakes or other features
*/
export function buildRiverSourceMap(context) {
    const fillMap = new PointSet()
    const fill = new SourceFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, {...context, fillMap})
    return origins
}


export class SourceFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        const {rect, riverSources, surfaceLayer, rainLayer} = fill.context
        const neighbors = Point.adjacents(parentPoint)
        let totalFlowsReceived = 0

        // test if neighbors flows points to parentPoint
        for(let relNeighbor of neighbors) {
            const isNeighborLand = surfaceLayer.isLand(relNeighbor)
            if (isNeighborLand) {
                if (flowsTo(fill, relNeighbor, parentPoint))
                    totalFlowsReceived++
            }
        }
        // this point receives no flows, maybe it's a river source
        if (totalFlowsReceived == 0) {
            const wrappedPoint = rect.wrap(parentPoint)
            // it's a river source only if it receives enough rain
            if (rainLayer.isRiverSource(wrappedPoint)) {
                riverSources.add(wrappedPoint)
            }
        }
        return neighbors
    }

    canFill(fill, fillPoint) {
        const {rect, fillMap, surfaceLayer} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const isLand = surfaceLayer.isLand(wrappedFillPoint)
        return isLand && ! fillMap.has(wrappedFillPoint)
    }

    onFill(fill, fillPoint, parentPoint, neighbors) {
        const {rect, fillMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        fillMap.add(wrappedFillPoint)
    }
}


function flowsTo(fill, originPoint, fillPoint) {
    // checks if originPoint flow points to fillPoint
    const origin = fill.context.rect.wrap(originPoint)
    const directionId = fill.context.flowMap.get(origin)
    const direction = Direction.fromId(directionId)
    const pointAtDirection = Point.atDirection(originPoint, direction)
    return Point.equals(fillPoint, pointAtDirection)
}