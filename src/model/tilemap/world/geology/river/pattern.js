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
        const river = buildRiver(context, riverId, source)
        context.rivers.set(riverId, river)
        riverId++
    }
}


function buildRiver(context, riverId, source) {
    const path = []
    let point = source
    while (context.surfaceLayer.isLand(point)) {
        const code = buildPatternCode(context, point)
        context.riverPatternCodes.set(point, code)
        path.push(point)
        point = getNextRiverPoint(context, point)
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
    const {rect, surfaceLayer, rainLayer, riverPatternCodes} = context
    const wrappedPoint = rect.wrap(point)
    const directionId = context.flowMap.get(wrappedPoint)
    const isRiverSource = context.riverSources.has(wrappedPoint)
    // non river sources must fill the center tile
    let centerCode = isRiverSource ? CENTER_CODE : 0
    // set the tile according to which direction is flowing
    const flowCode = DIRECTION_PATTERN_MAP.get(directionId)
    let code = flowCode + centerCode
    // add code for each neighbor that flows to this point
    Point.adjacents(wrappedPoint, (sidePoint, sideDirection) => {
        // ignore water neighbors
        const wrappedSidePoint = rect.wrap(sidePoint)
        if (surfaceLayer.isWater(sidePoint)) { return }
        // neighbor erosion flows here
        const receivesErosion = receivesFlow(context, sidePoint, point)
        if (receivesErosion && Point.hash(wrappedPoint) == '94,99') {
            console.log(wrappedSidePoint, sideDirection);
        }
        // it's a river source only if it receives enough rain
        const isSideRiverSource = rainLayer.isRiverSource(sidePoint)
        // if it has a pattern, it's already a river point
        const hasPattern = riverPatternCodes.has(wrappedSidePoint)
        // ignore adjacent water tiles
        if ((isSideRiverSource || hasPattern) && receivesErosion) {
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