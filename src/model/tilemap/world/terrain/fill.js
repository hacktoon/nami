import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'
import { LAND_OUTLINE } from './model'


const EMPTY = null


class HeightFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        fill.context.levelMap.set(point, level)
    }

    isEmpty(fill, point) {
        const isLand = fill.context.outlineMap.get(point) === LAND_OUTLINE.id
        return isLand && fill.context.levelMap.get(point) === EMPTY
    }

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class HeightMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, HeightFloodFill, context)
    }

    getChance(fill, origin) {
        return .1
    }

    getGrowth(fill, origin) {
        return 2
    }
}
