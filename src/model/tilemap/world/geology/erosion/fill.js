import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const EMPTY = null


class BasinFloodFill extends ConcurrentFillUnit {
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


export class BasinMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, BasinFloodFill, context)
    }
}
