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
const DIRECTION_CODE_MAP = {
    [Direction.NORTH.id]: 1,
    [Direction.WEST.id]: 2,
    [Direction.EAST.id]: 8,
    [Direction.SOUTH.i]: 16
}


/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    for(let source of context.riverSources.points) {
        const river = buildRiver(context, riverId, source)
        context.rivers.set(riverId, river)
        riverId++
    }
}


function buildRiver(context, riverId, source) {
    const path = []
    let next = source
    while (context.surfaceLayer.isLand(next)) {
        const code = buildPatternCode(context, next)
        path.push(next)
        next = getNextRiverPoint(context, next)
    }
    return {
        id: riverId,
        name: Random.choice(...RIVER_NAMES)
    }
}


function getNextRiverPoint(context, source) {
    const directionId = context.flowMap.get(context.rect.wrap(source))
    const direction = Direction.fromId(directionId)
    return Point.atDirection(source, direction)
}


function buildPatternCode(context, point) {
    const wrappedPoint = context.rect.wrap(point)
    const directionId = context.flowMap.get(wrappedPoint)
    const isRiverSource = context.riverSources.has(wrappedPoint)
    // non river sources must fill the center tile
    const centerCode = isRiverSource ? 0 : CENTER_CODE
    // set the tile according to which direction is flowing
    const flowCode = DIRECTION_CODE_MAP[directionId]
    let code = flowCode + centerCode
    // add code for each neighbor that flows to this point
    Point.adjacents(wrappedPoint, (sidePoint, direction) => {
        // ignore adjacent water tiles
        if (context.surfaceLayer.isWater(sidePoint)) return
        if (flowsTo(context, sidePoint, wrappedPoint)) {
            code += DIRECTION_CODE_MAP[direction.id]
        }
    })
    return code
}


function flowsTo(context, sourcePoint, targetPoint) {
    // checks if sourcePoint flow points to targetPoint
    const origin = context.rect.wrap(sourcePoint)
    const directionId = context.flowMap.get(origin)
    const direction = Direction.fromId(directionId)
    const pointAtDirection = Point.atDirection(sourcePoint, direction)
    return Point.equals(targetPoint, pointAtDirection)
}