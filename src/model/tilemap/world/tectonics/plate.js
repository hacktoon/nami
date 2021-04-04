import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { Color } from '/lib/base/color'
import { Random } from '/lib/base/random'
import { SimplexNoise } from '/lib/fractal/noise'
import { ScanlineFill } from '/lib/floodfill/scanline'

/*
TODO
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/

const OCEANIC_TYPE = 'O'
const CONTINENTAL_TYPE = 'C'
const NO_DEFORMATION = null
const OROGENY = 1
const TRENCH = 2
const RIFT = 3
const EMPTY = null


export class TectonicsTable {
    constructor(regionGroupTileMap) {
        this.regionGroupTileMap = regionGroupTileMap
        this.index = buildPlateIndex(regionGroupTileMap)
        this.geologicMap = buildGeologicMap(regionGroupTileMap)
    }

    getPlate(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        return this.index.get(group.id)
    }

    map(callback) {
        const entries = Array.from(this.index.values())
        return entries.map(callback)
    }

    forEach(callback) {
        this.index.forEach(callback)
    }
}


export class Plate {
    constructor(id, type, area) {
        this.id = id
        this.type = type
        this.area = area
        this.color = new Color()
        this.weight = Random.choice(1, 2, 2, 3, 3)
    }

    isOceanic() {
        return this.type == OCEANIC_TYPE
    }
}


function buildPlateIndex(regionGroupTileMap) {
    let oceanicArea = 0
    const halfMapArea = Math.floor(regionGroupTileMap.area / 2)
    const cmpDescArea = (groupA, groupB) => groupB.area - groupA.area
    const groups = regionGroupTileMap.groups.sort(cmpDescArea)
    const index = new Map()
    groups.forEach(group => {
        oceanicArea += group.area
        const type = oceanicArea < halfMapArea ? OCEANIC_TYPE : CONTINENTAL_TYPE
        const plate = new Plate(group.id, type, group.area)
        index.set(group.id, plate)
    })
    return index
}

function buildGeologicMap(tilemap) {
    const {width, height} = tilemap
    const matrix = new Matrix(width, height, () => EMPTY)
    tilemap.groups.forEach(group => {
        const simplex = new SimplexNoise(6, 0.8, 0.01)
        const origin = group.origin
        const canFill = point => {
            const currentGroup = tilemap.getGroup(point)
            const sameGroup = group.id === currentGroup.id
            return sameGroup && matrix.get(point) === EMPTY
        }
        const onFill = point => {
            const x = group.id * 1000
            const y = group.id * 1000
            const noisePoint = point.plus(new Point(x, y))
            if (noisePoint.x < 0 || noisePoint.y < 0)
                console.log(noisePoint);
            const noise = simplex.at(noisePoint)
            let value = 2
            if (group.id <= 2 || noise < 100) value = 0
            if (noise < 110) value = 1
            matrix.set(point, value)
        }
        const fill = new ScanlineFill(matrix, origin, onFill, canFill)
        fill.fill()
    })
    return matrix
}



export class ContinentMatrix {
    constructor(width, height, params) {
        const simplex = new SimplexNoise(6, 0.8, 0.01)

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

