import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'


export function buildSurveyFlowMap(context) {
    const fillMap = new PointSet()
    const fill = new SurveyFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, {...context, fillMap})
    return origins
}


export class SurveyFill extends ConcurrentFill {
    getNeighbors(fill, relSource) {
        const {rect, riverSources, riverMouths, reliefLayer} = fill.context
        const source = rect.wrap(relSource)
        const neighbors = Point.adjacents(relSource)
        let totalFlowsReceived = 0
        for(let relNeighbor of neighbors) {
            const neighborRelief = reliefLayer.get(relNeighbor)
            if (neighborRelief.water) {
                riverMouths.add(source)
            } else if (flowsTo(fill, relNeighbor, relSource)) {
                totalFlowsReceived++
            }
        }
        if (totalFlowsReceived == 0) {
            riverSources.add(source)
        }
        return neighbors
    }

    canFill(fill, relTarget) {
        const {rect, fillMap, reliefLayer} = fill.context
        const target = rect.wrap(relTarget)
        const relief = reliefLayer.get(target)
        return ! relief.water && ! fillMap.has(target)
    }

    onFill(fill, relTarget, relSource, neighbors) {
        const {rect, fillMap} = fill.context
        const target = rect.wrap(relTarget)
        fillMap.add(target)
    }
}


function flowsTo(fill, originPoint, targetPoint) {
    // checks if originPoint flow points to targetPoint
    const origin = fill.context.rect.wrap(originPoint)
    const directionId = fill.context.flowMap.get(origin)
    const direction = Direction.fromId(directionId)
    const pointAtDirection = Point.atDirection(originPoint, direction)
    return Point.equals(targetPoint, pointAtDirection)
}