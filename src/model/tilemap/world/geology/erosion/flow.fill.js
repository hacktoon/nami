import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'


export function buildFlowMap(context) {
    // start filling from land borders
    const flowContext = {...context, flowOriginSet: new PointSet()}
    let origins = context.reliefLayer.landBorders
    for(let reliefId of context.reliefLayer.getIdsByErosionStep()) {
        context.validReliefIds.add(reliefId)
        origins = fillFlowMap(origins, flowContext)
    }
}


function fillFlowMap(origins, context) {
    const nextOrigins = []
    // filter and return origins
    const queue = origins.concat(context.flowOriginSet.points)
    queue.forEach(point => {
        const relief = context.reliefLayer.get(point)
        if (context.validReliefIds.has(relief.id)) {
            nextOrigins.push(point)
            context.flowOriginSet.delete(point)
        } else {
            context.flowOriginSet.add(point)
        }
    })
    const fill = new ErosionFill()
    fill.start(nextOrigins, context)
    return nextOrigins
}


export class ErosionFill extends ConcurrentFill {
    getChance(fill) { return .1 }
    getGrowth(fill) { return 5 }

    getNeighbors(fill, relSource) {
        return Point.adjacents(relSource)
    }

    canFill(fill, relTarget, relSource) {
        const {rect, reliefLayer, validReliefIds, flowMap} = fill.context
        const target = rect.wrap(relTarget)
        const relief = reliefLayer.get(target)
        const isValidRelief = validReliefIds.has(relief.id)
        // use basin map to track which points were already visited
        const notVisited = ! flowMap.has(target)
        return ! relief.water && notVisited && isValidRelief
    }

    onInitFill(fill, relTarget) {
        // set the initial basin point to search water neighbor
        const {rect, reliefLayer, flowMap, basinMap} = fill.context
        const target = rect.wrap(relTarget)
        let hasWaterNeighbor = false
        let relLandNeighbor = null
        for(let relNeighbor of Point.adjacents(target)) {
            const neighbor = rect.wrap(relNeighbor)
            const neighborRelief = reliefLayer.get(neighbor)
            // set flow to nearest water neighbor
            if (neighborRelief.water) {
                const direction = this.#getDirection(relTarget, relNeighbor)
                flowMap.set(target, direction.id)
                // it's next to water, use original fill.id
                basinMap.set(target, fill.id)
                hasWaterNeighbor = true
                break
            }
            if (flowMap.has(neighbor)) {
                relLandNeighbor = relNeighbor
            }
        }
        // has no water neighbor and is empty, set flow
        if (! hasWaterNeighbor && ! flowMap.has(target)) {
            const direction = this.#getDirection(relTarget, relLandNeighbor)
            flowMap.set(target, direction.id)
            basinMap.set(target, basinMap.get(rect.wrap(relLandNeighbor)))
        }
    }

    onFill(fill, relTarget, relSource) {
        const {rect, flowMap, basinMap} = fill.context
        const target = rect.wrap(relTarget)
        const direction = this.#getDirection(relTarget, relSource)
        flowMap.set(target, direction.id)
        basinMap.set(target, basinMap.get(rect.wrap(relSource)))
    }

    onBlockedFill(fill, relTarget, relSource) {
        const {rect, reliefLayer, validReliefIds, flowOriginSet} = fill.context
        const target = rect.wrap(relTarget)
        const relief = reliefLayer.get(target)
        const isInvalidRelief = ! validReliefIds.has(relief.id)
        // add point to next relief fill
        if (! relief.water && isInvalidRelief) {
            flowOriginSet.add(target)
        }
    }

    #getDirection(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle)
    }
}
