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
        this.geologicMap = buildGeologicMap(this.index, regionGroupTileMap)
    }

    getPlate(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        return this.index.get(group.id)
    }

    isPlateBorderAt(point) {
        return this.regionGroupTileMap.isGroupBorderPoint(point)
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


const provinceMap = {}  // border regions depending on continents position must be islands


function buildGeologicMap(plateIndex, rgTilemap) {
    const {width, height} = rgTilemap
    const matrix = new Matrix(width, height, () => EMPTY)

    rgTilemap.forEach(group => {
        const plate = plateIndex.get(group.id)
        let landNoise = new SimplexNoise(6, 0.8, 0.01)
        let oceanNoise = new SimplexNoise(6, 0.8, 0.01)
        const canFill = point => {
            const currentGroup = rgTilemap.getGroup(point)
            const sameGroup = group.id === currentGroup.id
            return sameGroup && matrix.get(point) === EMPTY
        }
        const onFill = point => {
            const offset = new Point(group.id, group.id)
            const noisePoint = point.plus(offset)
            const landValue = landNoise.at(noisePoint)
            const oceanValue = oceanNoise.at(noisePoint)
            let value = 0 // ocean
            if (plate.isOceanic()) {
                value = oceanValue < 20 ? 1 : 0
            } else {
                value = landValue > 160 ? 2 : 1
            }
            matrix.set(point, value)
        }
        new ScanlineFill(group.origin, onFill, canFill).fill()
    })
    return matrix
}
