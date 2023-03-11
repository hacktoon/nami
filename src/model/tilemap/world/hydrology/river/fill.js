import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'

import { RIVER_NAMES } from './names'


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

const RIVER_MEANDER_MIDDLE = .5

/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    const {layers, maxFlowRate} = context
    const basinDivides = layers.basin.dividePoints.points
    // get basin divides where rains enough to form rivers
    const sourcePoints = basinDivides.filter(sourcePoint => {
        return layers.rain.createsRivers(sourcePoint)
    })
    for(let sourcePoint of sourcePoints) {
        buildRiver(context, sourcePoint, riverId++)
    }
}


function buildRiver(context, sourcePoint, riverId) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {
        layers, flowRate, rect, riverFlow, maxFlowRate,
        riverPoints, riverMeanders, riverMouths
    } = context
    let point = sourcePoint
    // save previous point for mouth detection
    let prevPoint = sourcePoint
    // init this river with current flow rate or zero if it's empty
    let rate = 1
    while (layers.surface.isLand(point)) {
        let wrappedPoint = rect.wrap(point)
        const basin = layers.basin.get(wrappedPoint)
        const directionBitmask = buildDirectionBitmask(context, wrappedPoint)
        riverFlow.set(wrappedPoint, directionBitmask)
        riverPoints.set(wrappedPoint, riverId)
        riverMeanders.set(wrappedPoint, buildMeanderPoint(basin))
        // has a rate, increase by one
        if (flowRate.has(wrappedPoint)) {
            rate = flowRate.get(wrappedPoint) + 1
        }
        flowRate.set(wrappedPoint, rate)
        prevPoint = wrappedPoint
        point = getNextRiverPoint(context, wrappedPoint)
    }
    // current point is water, add previous as river mouth
    riverMouths.add(prevPoint)
    maxFlowRate.set(riverId, rate)
}


function getNextRiverPoint(context, currentPoint) {
    const basin = context.layers.basin.get(context.rect.wrap(currentPoint))
    return Point.atDirection(currentPoint, basin.erosion)
}


function buildMeanderPoint(basin) {
    // choose a relative point around the middle of a square at [.5, .5]
    // use erosion direction to steer point
    const axis = basin.erosion.axis  // direction axis ([-1, 0], [1, 1], etc)
    const coord = axis => {
        const offset = Random.floatRange(.1, .3)
        const axisToggle = axis === 0 ? Random.choice(1, -1) : axis
        const newCoord = RIVER_MEANDER_MIDDLE + (offset * axisToggle)
        // no need of a higher precision, return one decimal float
        return newCoord.toFixed(1)
    }
    return [coord(axis[0]), coord(axis[1])]
}


function buildDirectionBitmask(context, point) {
    const {rect, layers, riverFlow} = context
    const wrappedPoint = rect.wrap(point)
    const basin = layers.basin.get(wrappedPoint)
    // set the tile according to which direction is flowing
    let flowCode = DIRECTION_PATTERN_MAP.get(basin.erosion.id)
    // add flowCode for each neighbor that flows to this point
    Point.adjacents(point, (sidePoint, sideDirection) => {
        // ignore water neighbors
        const wrappedSidePoint = rect.wrap(sidePoint)
        // ignore adjacent water tiles
        if (layers.surface.isWater(sidePoint)) { return }
        // neighbor basin flows here?
        if (! receivesFlow(context, sidePoint, point)) { return }
        // if it has a pattern, it's already a river point
        if (riverFlow.has(wrappedSidePoint)) {
            flowCode += DIRECTION_PATTERN_MAP.get(sideDirection.id)
        }
    })
    return flowCode
}


function receivesFlow(context, sourcePoint, targetPoint) {
    // checks if sourcePoint erosion points to targetPoint
    const origin = context.rect.wrap(sourcePoint)
    const basin = context.layers.basin.get(origin)
    const pointAtDirection = Point.atDirection(sourcePoint, basin.erosion)
    return Point.equals(targetPoint, pointAtDirection)
}
