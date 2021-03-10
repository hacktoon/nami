import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { SimplexNoise } from '/lib/noise'
import RegionMap from '/model/map/region'


function buildPlateRegionMap(params) {
    return RegionMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        scale: params.get('scale'), // 30
        seed: params.get('seed'),
        chance: 0.3,
        growth: 20,
    })
}

export class PlateMatrix {
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

/*
TODO
- create plates list
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/


class ContinentalMatrix {
    constructor(width, height) {
        this.matrix = new Matrix(width, height, point => {})
    }

    get (point) {
        return this.matrix.get(point)
    }
}


export class Plate {
    constructor(id) {
        this.id = id
        this.name = ''
    }
}

