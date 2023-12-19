import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'


// bitmask value => point in matrix 3x3
/*
       1(N)
 2(W)         8 (E)
       16(S)
*/
// detect matrix in source file
export const DIRECTION_PATTERN_MAP = new Map([
    [Direction.NORTH.id, 1],
    [Direction.WEST.id, 2],
    [Direction.EAST.id, 8],
    [Direction.SOUTH.id, 16],
])

const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others


export class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, midpointMap, erosionOutput,
            basinMap, distanceMap, layoutMap, colorMap,
            erosionMap
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
        // find neighbors to set initial erosion layout direction
        let code = 0
        for(let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                const direction = getDirection(fillPoint, neighbor)
                erosionMap.setFlow(wrappedFillPoint, direction)
                // add erosion on that direction
                erosionMap.addPath(wrappedFillPoint, direction)
                // delete below
                erosionOutput.set(wrappedFillPoint, direction.id)
                code += DIRECTION_PATTERN_MAP.get(direction.id)
                // delete above
                break  // stop on first water neighbor
            }
        }
        layoutMap.set(wrappedFillPoint, code)
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
        const {rect, basinMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        return ! basinMap.has(wrappedFillPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            rect, erosionOutput, basinMap, midpointMap,
            distanceMap, layoutMap, erosionMap
        } = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        const directionToMouth = getDirection(fillPoint, parentPoint)
        const directionFromSource = getDirection(parentPoint, fillPoint)
        // distance to source by point
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(wrappedPoint, currentDistance + 1)
        // use basin value from parent point
        basinMap.set(wrappedPoint, basinMap.get(wrappedParentPoint))
        // set midpoint for rendering  TODO: move to upper layer
        midpointMap.set(wrappedPoint, buildMidPoint())

        // use code below
        // set erosion flow on this point
        erosionMap.setFlow(wrappedPoint, directionToMouth)
        // set erosion flow on this point and in parent
        erosionMap.addPath(wrappedPoint, directionToMouth)
        erosionMap.addPath(wrappedParentPoint, directionFromSource)

        // delete code below
        // set direction to source
        erosionOutput.set(wrappedPoint, directionToMouth.id)
        // update erosion direction layout on parent point
        const codeSum = layoutMap.get(wrappedParentPoint)
        const code = DIRECTION_PATTERN_MAP.get(directionFromSource.id)
        layoutMap.set(wrappedParentPoint, codeSum + code)
        // set layout on this point
        const mouthCodeSum = layoutMap.get(wrappedPoint)
        const mouthCode = DIRECTION_PATTERN_MAP.get(directionToMouth.id)
        layoutMap.set(wrappedPoint, mouthCodeSum + mouthCode)
    }
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
