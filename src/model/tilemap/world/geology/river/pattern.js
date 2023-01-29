import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'


import { RIVER_NAMES } from './names'


// bitmask value => point in matrix 3x3
/*
       1(N)
 2(W)    4     8 (E)
       16(S)
*/
// detect matrix in source file
const CENTER_CODE = 4
export const DIRECTION_PATTERN_MAP = new Map([
    [Direction.NORTH.id, 1],
    [Direction.WEST.id, 2],
    [Direction.EAST.id, 8],
    [Direction.SOUTH.id, 16],
])


/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    for(let source of context.riverSources.points) {
        // if (riverId == 0) {
        //     console.log(source);
        // }
        const maxFlowRate = buildRiver(context, source)
        context.riverMaxFlowRate.set(riverId, maxFlowRate)
        riverId++
    }
}


function buildRiver(context, source) {
    const {flowRate, rect, surfaceLayer, riverPatterns} = context
    let point = source
    let wrappedPoint = rect.wrap(point)
    // init this river with current flow rate or zero if it's empty
    let riverFlowRate = flowRate.get(wrappedPoint) ?? 0
    while (surfaceLayer.isLand(point)) {
        let wrappedPoint = rect.wrap(point)
        const code = buildPatternCode(context, wrappedPoint)
        riverPatterns.set(wrappedPoint, code)
        flowRate.set(wrappedPoint, ++riverFlowRate)
        point = getNextRiverPoint(context, wrappedPoint)
    }
    return riverFlowRate
}


function getNextRiverPoint(context, currentPoint) {
    const directionId = context.flowMap.get(context.rect.wrap(currentPoint))
    const direction = Direction.fromId(directionId)
    return Point.atDirection(currentPoint, direction)
}


function buildPatternCode(context, point) {
    const {rect, surfaceLayer, riverPatterns} = context
    const wrappedPoint = rect.wrap(point)
    const directionId = context.flowMap.get(wrappedPoint)
    const isRiverSource = context.riverSources.has(wrappedPoint)
    // non river sources must fill the center tile
    let centerCode = isRiverSource ? CENTER_CODE : 0
    // set the tile according to which direction is flowing
    const flowCode = DIRECTION_PATTERN_MAP.get(directionId)
    let code = flowCode + centerCode
    // add code for each neighbor that flows to this point
    Point.adjacents(point, (sidePoint, sideDirection) => {
        // ignore water neighbors
        const wrappedSidePoint = rect.wrap(sidePoint)
        // ignore adjacent water tiles
        if (surfaceLayer.isWater(sidePoint)) { return }
        // neighbor erosion flows here?
        if (! receivesFlow(context, sidePoint, point)) { return }
        // if it has a pattern, it's already a river point
        if (riverPatterns.has(wrappedSidePoint)) {
            code += DIRECTION_PATTERN_MAP.get(sideDirection.id)
        }
    })
    return code
}


function receivesFlow(context, sourcePoint, targetPoint) {
    // checks if sourcePoint flow points to targetPoint
    const origin = context.rect.wrap(sourcePoint)
    const directionId = context.flowMap.get(origin)
    const direction = Direction.fromId(directionId)
    const pointAtDirection = Point.atDirection(sourcePoint, direction)
    return Point.equals(targetPoint, pointAtDirection)
}