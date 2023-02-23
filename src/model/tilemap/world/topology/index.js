import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'

import { Topology } from './data'


export class TopologyLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {

        })
    }

    get(point) {

    }

    getText(point) {

    }
}
