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
            basinMap, distanceMap, colorMap, erosionVectorMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // create a basin midpoint
        const midPoint = buildMidPoint()
        midpointMap.set(wrappedFillPoint, midPoint)
        // set basin id to spread on fill
        basinMap.set(wrappedFillPoint, fill.id)
        // set basin color
        colorMap.set(fill.id, new Color())
        // initial distance is 1
        distanceMap.set(wrappedFillPoint, 1)
        // find water neighbor to set initial erosion path
        const paths = []
        for(let neighbor of neighbors) {
            // border is initial point of erosion vectors
            // set direction from each neighbor to midpoint
            const sideRate = buildSideRate(layers, wrappedFillPoint, neighbor)
            paths.push([neighbor, sideRate])
            if (layers.surface.isWater(neighbor)) {
                const direction = getDirection(fillPoint, neighbor)
                erosionMap.set(wrappedFillPoint, direction.id)
                break
            }
        }
        erosionVectorMap.set(wrappedFillPoint, paths)
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
        const {rect, layers, erosionMap} = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // use erosion map to track already visited points
        return ! erosionMap.has(wrappedFillPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            layers, rect, erosionMap, basinMap, midpointMap,
            distanceMap, erosionVectorMap
        } = fill.context
        const point = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        const directionToSource = getDirection(fillPoint, parentPoint)
        const currentDistance = distanceMap.get(wrappedParentPoint)
        const midPoint = buildMidPoint()
        const sideRate = buildSideRate(layers, point, wrappedParentPoint)
        const currentList = erosionVectorMap.get(point) ?? []
        distanceMap.set(point, currentDistance + 1)
        midpointMap.set(point, midPoint)
        // set direction to source
        erosionMap.set(point, directionToSource.id)
        // use basin value from parent point
        basinMap.set(point, basinMap.get(wrappedParentPoint))
        currentList.push([wrappedParentPoint, sideRate])
        erosionVectorMap.set(point, currentList)
    }
}


function buildSideRate(layers, point, parentPoint) {
    const rate = layers.noise.getGrained(point)
    const parentRate = layers.noise.getGrained(parentPoint)
    return ((rate + parentRate) / 2).toFixed(1)
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
