import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Random } from '/src/lib/random'
import { Matrix } from '/src/lib/matrix'


const MIDDLE = .5


export function buildMatrix(layers, rect, point) {
    // get river line - after reworking rivers
    const isBlockWater = layers.surface.isWater(point)
    return Matrix.fromRect(rect, point => {
        // get 3x3 point value
        const [x, y] = [Random.float(), Random.float()]
        //
        if (isBlockWater) {
            return Random.choice(0, 0, 0, 0, 0, 0, 1)
        }
        return Random.choice(0, 1, 2)
    })
}


function build_neighborhood(point) {
    let totalWater = 0
    Point.around(point, (sidePoint, dir) => {

    })
}


function build_pivot_points() {
    const p00 = [0, 0]
    const p01 = [.5, 0] // add variation based on noise
    const p02 = [0, 1] // add variation based on noise
}