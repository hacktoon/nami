import { PointMap } from '/src/lib/point/map'
import { Point } from '/src/lib/point'


export class ErosionMap {
    #inputs = new PointMap()
    #output = new PointMap()

    addInput(point, offset, direction) {
        const inputs = this.#inputs.get(point)
        inputs.push([offset, direction])
        this.#inputs.set(point, inputs)
    }

    setOutput(point, offset, direction) {
        this.#output.set(point, [offset, direction])
    }

    get(point) {
        const output = this.#output.get(point)
        return {

        }
    }
}


