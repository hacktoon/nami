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
    const fillMap = new PointSet()
    const fill = new WaterSourceFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, {...context, fillMap})
    return origins
}


export class WaterSourceFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        const {
            rect, riverSources, surfaceLayer, rainLayer, lakePoints
        } = fill.context
        const neighbors = Point.adjacents(parentPoint)
        let totalFlowsReceived = 0
        for(let neighbor of neighbors) {
            const isNeighborLand = surfaceLayer.isLand(neighbor)
            // test if neighbors flows points to parentPoint
            if (isNeighborLand && flowsTo(fill, neighbor, parentPoint)) {
                totalFlowsReceived++
            }
        }
        // this point receives no flows, maybe it's a river source
        const wrappedPoint = rect.wrap(parentPoint)
        const rainsForms = rainLayer.isRiverSource(wrappedPoint)
        // it's a river source only if it receives enough rain
        if (rainsForms) {
            if (totalFlowsReceived == 0) {
                riverSources.add(wrappedPoint)
            }
            if (Random.chance(LAKE_CHANCE)) {
                lakePoints.set(wrappedPoint)
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

    onFill(fill, fillPoint) {
        const {rect, fillMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        fillMap.add(wrappedFillPoint)
    }
}


function flowsTo(fill, originPoint, fillPoint) {
    // checks if originPoint flow points to fillPoint
    const origin = fill.context.rect.wrap(originPoint)
    const erosion = fill.context.erosionLayer.get(origin)
    const pointAtDirection = Point.atDirection(originPoint, erosion.flow)
    return Point.equals(fillPoint, pointAtDirection)
}