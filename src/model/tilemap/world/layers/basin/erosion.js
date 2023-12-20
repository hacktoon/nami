import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


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


export class ErosionPointMap {
    #patternMap = new PointMap()
    #typeMap = new PointMap()
    #flowMap = new PointMap()

    setFlow(source, direction) {
        // source must be wrapped
        this.#flowMap.set(source, direction.id)
    }

    getFlow(point) {
        const directionId = this.#flowMap.get(point)
        return Direction.fromId(directionId)
    }

    hasFlow(point) {
        return this.#flowMap.has(point)
    }

    addPath(sourcePoint, direction) {
        // sourcePoint must be wrapped
        const code = DIRECTION_PATTERN_MAP.get(direction.id)
        const codeSum = this.#patternMap.get(sourcePoint)
        this.#patternMap.set(sourcePoint, codeSum + code)
    }

    getBorderPoints(point) {
        return [this.#patternMap.get(point)]
    }
}
