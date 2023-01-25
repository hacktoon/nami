import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Matrix } from '/src/lib/matrix'


import { RIVER_NAMES } from './names'


// bitmask value => point in matrix 3x3
const CODE_POINTS = [
    [1, [0, 0]],
    [2, [0, 1]],
    [4, [0, 2]],
    [8, [1, 0]],
    [16, [1, 1]],
    [32, [1, 2]],
    [64, [2, 0]],
    [128, [2, 1]],
    [256, [2, 2]],
]


/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverShapeMap(context) {
    let riverId = 0
    for(let source of context.riverSources.points) {
        const river = buildRiver(context, riverId, source)
        context.rivers.set(riverId, river)
        riverId++
    }
}


function buildRiver(context, riverId, source) {
    const river = {id: riverId, name: Random.choice(...RIVER_NAMES)}
    const path = followPath(context, source)
    // console.log(path);
    return river
}


function followPath(context, source) {
    const path = []
    let next = source
    while (context.surfaceLayer.isLand(next)) {
        const directionId = context.flowMap.get(context.rect.wrap(next))
        const direction = Direction.fromId(directionId)
        path.push(next)
        next = Point.atDirection(next, direction)
    }
    return path
}

