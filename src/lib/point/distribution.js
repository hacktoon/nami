import { repeat } from '/lib/function'
import { Point } from './'


export class RandomPointDistribution {
    static create(count, width, height) {
        if (count <= 0) count = 1
        return repeat(count, () => Point.random(width, height))
    }
}