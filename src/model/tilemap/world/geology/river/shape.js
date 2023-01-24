import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'


import { RIVER_NAMES } from './names'

/*
    The struct fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverShapeMap(context) {
    let riverId = 0
    for(let source of context.riverSources.points) {
        const river = {id: riverId, name: Random.choice(RIVER_NAMES)}
        context.rivers.set(riverId, river)
        riverId++
    }
}


function getNext(context, source) {
    const direction = Direction.fromId(context.flowMap.get(source))
    return Point.atDirection(source, direction)
    //context.rect.wrap(relNextPoint)
}

