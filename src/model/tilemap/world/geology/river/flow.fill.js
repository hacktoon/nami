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
        // update origins (points)
        origins = fillReliefFlowMap(origins, context)
    }
}


function fillReliefFlowMap(origins, context) {
    // run a fill for allowed reliefs in validReliefIds
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
    getChance(fill) { return .3 }
    getGrowth(fill) { return 3 }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint) {
        const {rect, reliefLayer, validReliefIds, flowMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const relief = reliefLayer.get(wrappedFillPoint)
        const isValidRelief = validReliefIds.has(relief.id)
        // use basin map to track which points were already visited
        const isEmpty = ! flowMap.has(wrappedFillPoint)
        return ! relief.water && isEmpty && isValidRelief
    }

    onInitFill(fill, fillPoint, neighbors) {
        // set the initial fill point to search water neighbor
        // considers if it's basin (has water neighbor) or inland
        const {rect, flowMap, basinMap, riverMouths} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // already filled, exit
        if (flowMap.has(wrappedFillPoint)) {
            return
        }
        const waterNeighbor = this.#getWaterNeighbor(fill, neighbors)
        // set flow if has no water neighbor (not a river mouth) and is empty
        if (waterNeighbor) {
            const direction = getDirection(fillPoint, waterNeighbor)
            flowMap.set(wrappedFillPoint, direction.id)
            // it's next to water, use original fill.id
            basinMap.set(wrappedFillPoint, fill.id)
            // if neighbor is water, this is a river mouth
            riverMouths.add(wrappedFillPoint)
        } else {
            const landNeighbor = this.#getLandNeighbor(fill, neighbors)
            if (landNeighbor) {
                const direction = getDirection(fillPoint, landNeighbor)
                flowMap.set(wrappedFillPoint, direction.id)
                // set land neighbor basin
                const wrappedNeighbor = rect.wrap(landNeighbor)
                basinMap.set(wrappedFillPoint, basinMap.get(wrappedNeighbor))
            }
        }
    }

    #getWaterNeighbor(fill, neighbors) {
        for(let neighbor of neighbors) {
            const neighborRelief = fill.context.reliefLayer.get(neighbor)
            // set flow to nearest water neighbor
            if (neighborRelief.water) {
                return neighbor
            }
        }
    }

    #getLandNeighbor(fill, neighbors) {
        // need to read neighbors on start fill to get parent flow
        const {rect, reliefLayer, flowMap} = fill.context
        for(let neighbor of neighbors) {
            const wrappedNeighbor = rect.wrap(neighbor)
            const neighborRelief = reliefLayer.get(wrappedNeighbor)
            // is land, check if has a flow already
            if (! neighborRelief.water && flowMap.has(wrappedNeighbor)) {
                return neighbor
            }
        }
    }

    onFill(fill, fillPoint, parentPoint) {
        const {rect, flowMap, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const _parentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        // set direction to source
        flowMap.set(wrappedFillPoint, directionToSource.id)
        // use basin value from parent point
        basinMap.set(wrappedFillPoint, basinMap.get(_parentPoint))
    }

    onBlockedFill(fill, fillPoint) {
        const {rect, reliefLayer, validReliefIds, deferredOrigins} = fill.context
        const target = rect.wrap(fillPoint)
        const relief = reliefLayer.get(target)
        const isInvalidRelief = ! validReliefIds.has(relief.id)
        // add point to next relief fill
        if (! relief.water && isInvalidRelief) {
            deferredOrigins.add(target)
        }
    }
}


function getDirection(sourcePoint, targetPoint) {
    const angle = Point.angle(sourcePoint, targetPoint)
    return Direction.fromAngle(angle)
}
