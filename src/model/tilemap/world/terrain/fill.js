import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'
import { LAND_OUTLINE } from './model'


const EMPTY = null


class HeightFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const isLand = fill.context.outlineMap.get(point) === LAND_OUTLINE.id
        let value = isLand ? level : -level
        fill.context.levelMap.set(point, value)
    }

    isEmpty(fill, point) {
        return fill.context.levelMap.get(point) === EMPTY
    }

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class HeightMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, HeightFloodFill, context)
    }
}
