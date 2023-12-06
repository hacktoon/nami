import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others


export class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, midpointMap, erosionOutput,
            basinMap, distanceMap, colorMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // set basin color
        colorMap.set(fill.id, new Color())
        // create a basin midpoint
        const midPoint = buildMidPoint()
        midpointMap.set(wrappedFillPoint, midPoint)
        // set basin id to spread on fill
        basinMap.set(wrappedFillPoint, fill.id)
        // initial distance is 1
        distanceMap.set(wrappedFillPoint, 1)
        // find water neighbor to set initial erosion path
        for(let neighbor of neighbors) {
            // border is initial point of erosion vectors
            // set direction from each neighbor to midpoint
            // discover and change output
            if (layers.surface.isWater(neighbor)) {
                // const offset = buildSideAnchor(layers, wrappedFillPoint, neighbor)
                const direction = getDirection(fillPoint, neighbor) // remove
                erosionOutput.set(wrappedFillPoint, direction.id)
                break
            }
        }
    }

    getNeighbors(fill, parentPoint) {
        const {rect, dividePoints} = fill.context
        const adjacents = Point.adjacents(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
            const wrappedParentPoint = rect.wrap(parentPoint)
            dividePoints.add(wrappedParentPoint)
        }
        return adjacents
    }

    canFill(fill, fillPoint) {
        const {rect, erosionOutput} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // use erosion map to track already visited points
        return ! erosionOutput.has(wrappedFillPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            layers, rect, erosionOutput, basinMap, midpointMap,
            distanceMap
        } = fill.context
        const point = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        const currentDistance = distanceMap.get(wrappedParentPoint)
        const sideAnchor = buildSideAnchor(layers, point, wrappedParentPoint)
        distanceMap.set(point, currentDistance + 1)
        midpointMap.set(point, buildMidPoint())
        // set direction to source
        erosionOutput.set(point, directionToSource.id)
        // use basin value from parent point
        basinMap.set(point, basinMap.get(wrappedParentPoint))


    }
}


function buildSideAnchor(layers, point, parentPoint) {
    const rate = layers.noise.getGrained(point)
    const parentRate = layers.noise.getGrained(parentPoint)
    return (rate + parentRate) / 2
}


function buildMidPoint() {
    const min = .2
    const max = .8
    return [
        Random.floatRange(min, max).toFixed(1),
        Random.floatRange(min, max).toFixed(1)
    ]
}

function getDirection(sourcePoint, targetPoint) {
    // need to get unwrapped points to get real angle
    const angle = Point.angle(sourcePoint, targetPoint)
    return Direction.fromAngle(angle)
}


function isDivide(context, neighbors) {
    const {rect, erosionOutput, layers} = context
    // it's a river source if every neighbor is water
    let waterNeighborCount = 0
    let blockedCount = 0
    for(let neighbor of neighbors) {
        const isNeighborWater = layers.surface.isWater(neighbor)
        const isOccupied = erosionOutput.has(rect.wrap(neighbor))
        waterNeighborCount += isNeighborWater ? 1 : 0
        blockedCount += (isNeighborWater || isOccupied) ? 1 : 0
    }
    const allNeighborsWater = waterNeighborCount === neighbors.length
    const allNeighborsBlocked = blockedCount === neighbors.length
    return allNeighborsWater || allNeighborsBlocked
}
