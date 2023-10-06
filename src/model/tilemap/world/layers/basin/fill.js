import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others


export function buildBasinMap(context) {
    // start filling from land borders
    let origins = context.layers.surface.landBorders
    const fill = new BasinFill()
    fill.start(origins, context)
}

class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        // set the initial fill point on river mouth
        const {
            rect, layers, midpointMap, erosionMap,
            basinMap, distanceMap, colorMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // create a basin midpoint
        const midpoint = buildMidPoint()
        midpointMap.set(wrappedFillPoint, midpoint)
        // set basin id to spread on fill
        basinMap.set(wrappedFillPoint, fill.id)
        // set basin color
        colorMap.set(fill.id, new Color())
        // initial distance is 1
        distanceMap.set(wrappedFillPoint, 1)
        // find water neighbor
        for(let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                const direction = getDirection(fillPoint, neighbor)
                erosionMap.set(wrappedFillPoint, direction.id)
                break
            }
        }
    }

    getNeighbors(fill, parentPoint) {
        const {rect, layers, dividePoints} = fill.context
        const adjacents = Point.adjacents(parentPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
            dividePoints.add(wrappedParentPoint)
        }
        return adjacents
    }

    canFill(fill, fillPoint) {
        const {rect, layers, erosionMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        const surface = layers.surface.get(wrappedFillPoint)
        // use flow map to track already visited points
        const isEmpty = ! erosionMap.has(wrappedFillPoint)
        return ! surface.water && isEmpty
    }

    onFill(fill, fillPoint, parentPoint) {
        const {rect, erosionMap, basinMap, midpointMap, distanceMap} = fill.context
        const point = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(point, currentDistance + 1)
        midpointMap.set(point, buildMidPoint())
        // set direction to source
        erosionMap.set(point, directionToSource.id)
        // use basin value from parent point
        basinMap.set(point, basinMap.get(wrappedParentPoint))
    }
}


function buildMidPoint() {
    const min = .2
    const max = .8
    return [
        Random.floatRange(min, max),
        Random.floatRange(min, max)
    ]
}

function getDirection(sourcePoint, targetPoint) {
    // need to get unwrapped points to get real angle
    const angle = Point.angle(sourcePoint, targetPoint)
    return Direction.fromAngle(angle)
}


function isDivide(context, neighbors) {
    const {rect, erosionMap, layers} = context
    // it's a river source if every neighbor is water
    let waterNeighborCount = 0
    let blockedCount = 0
    for(let neighbor of neighbors) {
        const isNeighborWater = layers.surface.isWater(neighbor)
        const isOccupied = erosionMap.has(rect.wrap(neighbor))
        waterNeighborCount += isNeighborWater ? 1 : 0
        blockedCount += (isNeighborWater || isOccupied) ? 1 : 0
    }
    const allNeighborsWater = waterNeighborCount === neighbors.length
    const allNeighborsBlocked = blockedCount === neighbors.length
    return allNeighborsWater || allNeighborsBlocked
}
