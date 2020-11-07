import { repeat } from '/lib/function'
import { Point } from '.'
import { PointSet } from './set'


export class RandomPointDistribution {
    static create(count, width, height) {
        if (count <= 0) count = 1
        return repeat(count, () => Point.random(width, height))
    }
}


export class EvenPointDistribution {
    static create(count, width, height, minDistance=1) {
        if (count <= 0) count = 1
        const points = []
        const hash = createPointHash(width, height)

    }
}


function createPointHash(width, height) {
    const hash = new PointSet()
    for(let i=0; i<width; i++) {
        for(let j=0; j<height; j++) {
            hash.add(new Point(i, j))
        }
    }
    return hash
}