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
    const fill = new SurveyFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, {...context, fillMap})
    return origins
}


export class SurveyFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        const {rect, riverSources, reliefLayer} = fill.context
        const _parentPoint = rect.wrap(parentPoint)
        const neighbors = Point.adjacents(parentPoint)
        let totalFlowsReceived = 0

        // test if neighbors flows points to _parentPoint
        for(let relNeighbor of neighbors) {
            const neighborRelief = reliefLayer.get(relNeighbor)
            if (!neighborRelief.water) {
                if (flowsTo(fill, relNeighbor, parentPoint))
                    totalFlowsReceived++
            }
        }
        // this point receives no flows, then it's a river source
        if (totalFlowsReceived == 0) {
            riverSources.add(_parentPoint)
        }
        return neighbors
    }

    canFill(fill, fillPoint) {
        const {rect, fillMap, reliefLayer} = fill.context
        const _fillPoint = rect.wrap(fillPoint)
        const relief = reliefLayer.get(_fillPoint)
        return ! relief.water && ! fillMap.has(_fillPoint)
    }

    onFill(fill, fillPoint, parentPoint, neighbors) {
        const {rect, fillMap} = fill.context
        const _fillPoint = rect.wrap(fillPoint)
        fillMap.add(_fillPoint)
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