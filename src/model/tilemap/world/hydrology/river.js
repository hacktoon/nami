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


const MEANDER_DIRECTION_MAP = new Map([
    [Direction.NORTH.id, []],
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
export function buildRiverFlowMap(context) {
    let riverId = 0
    for(let source of context.basinLayer.riverSources.points) {
        const maxFlowRate = buildRiver(context, riverId, source)
        context.maxFlowRate.set(riverId, maxFlowRate)
        riverId++
    }
}


function buildRiver(context, riverId, source) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {
        flowRate, rect, surfaceLayer, basinLayer, riverFlow,
        riverPoints, riverMeanders, riverMouths
    } = context
    let point = source
    // save previous point for mouth detection
    let prevPoint = source
    // init this river with current flow rate or zero if it's empty
    let rate = 0
    while (surfaceLayer.isLand(point)) {
        let wrappedPoint = rect.wrap(point)
        const code = buildFlowCode(context, wrappedPoint)
        const basin = basinLayer.get(wrappedPoint)
        riverFlow.set(wrappedPoint, code)
        riverPoints.set(wrappedPoint, riverId)
        riverMeanders.set(wrappedPoint, buildMeanderPoint(basin))
        if (flowRate.has(wrappedPoint)) {
            rate = flowRate.get(wrappedPoint) + 1
        }
        rate ++
        flowRate.set(wrappedPoint, rate)
        prevPoint = wrappedPoint
        point = getNextRiverPoint(context, wrappedPoint)
    }
    riverMouths.add(prevPoint)
    return rate
}


function getNextRiverPoint(context, currentPoint) {
    const basin = context.basinLayer.get(context.rect.wrap(currentPoint))
    return Point.atDirection(currentPoint, basin.erosion)
}


function buildMeanderPoint(basin) {
    // choose a relative point around the middle of a square at [.5, .5]
    // use erosion direction to steer point
    const axis = basin.erosion.axis  // direction axis ([-1, 0], [1, 1], etc)
    const coord = axis => {
        const offset = Random.floatRange(.2, .4)
        const axisOffset = axis === 0 ? Random.choice(1, -1) : axis
        const newCoord = (offset * axisOffset) + RIVER_MEANDER_MIDDLE
        // no need of a higher precision, return one decimal float
        return newCoord.toFixed(1)
    }
    return [coord(axis[0]), coord(axis[1])]
}


function buildFlowCode(context, point) {
    const {rect, surfaceLayer, riverFlow} = context
    const wrappedPoint = rect.wrap(point)
    const basin = context.basinLayer.get(wrappedPoint)
    // set the tile according to which direction is flowing
    let flowCode = DIRECTION_PATTERN_MAP.get(basin.erosion.id)
    // add flowCode for each neighbor that flows to this point
    Point.adjacents(point, (sidePoint, sideDirection) => {
        // ignore water neighbors
        const wrappedSidePoint = rect.wrap(sidePoint)
        // ignore adjacent water tiles
        if (surfaceLayer.isWater(sidePoint)) { return }
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
    const basin = context.basinLayer.get(origin)
    const pointAtDirection = Point.atDirection(sourcePoint, basin.erosion)
    return Point.equals(targetPoint, pointAtDirection)
}
