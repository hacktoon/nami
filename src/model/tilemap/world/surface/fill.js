import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const EMPTY = null


class HeightFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        fill.context.heightMap.set(point, level)
    }

    isEmpty(fill, point) {
        const isLand = fill.context.surfaceMap.get(point) > 0
        return isLand && fill.context.heightMap.get(point) === EMPTY
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
