import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { Color } from '/lib/base/color'
import { Random } from '/lib/base/random'
import { SimplexNoise } from '/lib/noise'

/*
TODO
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/


export class ContinentMatrix {
    constructor(width, height, params) {
        const simplex = new SimplexNoise(6, 0.8, 0.01)
        const regionMap = buildPlateRegionMap(params)
        this.matrix = new Matrix(
            width,
            height,
            point => {
                const region = regionMap.getRegion(point)
                const x = region.id * 1000
                const y = region.id * 1000
                const noisePt = point.plus(new Point(x, y))
                const value = simplex.at(noisePt)
                if (region.id <= 3 || value < 100) return 0
                if (value < 140) return 1
                return 2
            }
        )
    }

    get(point) {
        return this.matrix.get(point)
    }
}


export class Plate {
    constructor(id, area) {
        this.id = id
        this.area = area
        this.color = new Color()
        this.weight = Random.choice(1, 2, 2, 3, 3)
    }
}
