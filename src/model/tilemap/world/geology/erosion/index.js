import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


export class ErosionModel {
    #idMap

    constructor(rect, terrainModel) {
        this.#idMap = Matrix.fromRect(rect, point => {
            // for (let sidePoint of Point.adjacents(point)) {
            //     if (currentId != layer.get(sidePoint)) {
            //         this.#shorePoints.push(point)
            //     }
            // }
        })
    }

    get(point) {
        return
    }
}

