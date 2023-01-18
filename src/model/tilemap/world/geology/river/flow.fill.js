import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'


export function buildFlowMap(baseContext) {
    // stores points that must be filled on higher reliefs
    const deferredOrigins = new PointSet()
    // cumulative set of reliefs that can be filled in this iteration
    const validReliefIds = new Set()
    // start filling from land borders
    let origins = baseContext.reliefLayer.landBorders
    const context = {...baseContext, deferredOrigins, validReliefIds}
    // start from lower to higher land reliefs, filling each layer
    for(let relief of context.reliefLayer.getLandReliefs()) {
        // add current relief for next fill
        validReliefIds.add(relief.id)
        origins = fillReliefFlowMap(origins, context)
    }
}


function fillReliefFlowMap(origins, context) {
    const nextOrigins = []
    // add received origins to deferred to next relief
    // and filter which one are allowed in this relief
    const pointQueue = origins.concat(context.deferredOrigins.points)
    pointQueue.forEach(point => {
        const relief = context.reliefLayer.get(point)
        if (context.validReliefIds.has(relief.id)) {
            nextOrigins.push(point)
            context.deferredOrigins.delete(point)
        } else {
            context.deferredOrigins.add(point)
        }
    })
    const fill = new RiverFlowFill()
    fill.start(nextOrigins, context)
    return nextOrigins
}


class RiverFlowFill extends ConcurrentFill {
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

    onInitFill(fill, relTarget, neighbors) {
        // set the initial basin point to search water neighbor
        const {
            rect, reliefLayer, flowMap, basinMap, riverMouths
        } = fill.context
        const target = rect.wrap(relTarget)
        let relLandNeighbor = null
        for(let relNeighbor of neighbors) {
            const neighborRelief = reliefLayer.get(relNeighbor)
            // set flow to nearest water neighbor
            if (neighborRelief.water) {
                const direction = this.#getDirection(relTarget, relNeighbor)
                flowMap.set(target, direction.id)
                // it's next to water, use original fill.id
                basinMap.set(target, fill.id)
                // if neighbor is water, this is a river mouth
                riverMouths.add(target)
                break
            } else {
                // neighbor is land
                const neighbor = rect.wrap(relNeighbor)
                if (flowMap.has(neighbor)) {
                    // choose any land neighbor
                    // only if it hasn't been set yet by another fill
                    relLandNeighbor = relNeighbor
                }
            }
        }
        // has no water neighbor (not a river mouth) and is empty
        // then set flow
        const notRiverMouth = ! riverMouths.has(target)
        const hasNoFlow = ! flowMap.has(target)
        if (notRiverMouth && hasNoFlow) {
            const direction = this.#getDirection(relTarget, relLandNeighbor)
            flowMap.set(target, direction.id)
            // use neighbor basin
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
        const {rect, reliefLayer, validReliefIds, deferredOrigins} = fill.context
        const target = rect.wrap(relTarget)
        const relief = reliefLayer.get(target)
        const isInvalidRelief = ! validReliefIds.has(relief.id)
        // add point to next relief fill
        if (! relief.water && isInvalidRelief) {
            deferredOrigins.add(target)
        }
    }

    #getDirection(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle)
    }
}
