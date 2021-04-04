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
    tilemap.forEach(group => {
        let simplex = new SimplexNoise(7, 0.7, 0.01)
        if (group.id % 2 === 0)
            simplex = new SimplexNoise(5, 0.8, 0.02)
        const coordOffset = group.id
        const canFill = point => {
            const currentGroup = tilemap.getGroup(point)
            const sameGroup = group.id === currentGroup.id
            return sameGroup && matrix.get(point) === EMPTY
        }
        const onFill = point => {
            const offset = new Point(coordOffset, coordOffset)
            const noisePoint = point.plus(offset)
            const noise = simplex.at(noisePoint)
            let value = 1
            if (noise < 150) value = 2
            if (group.id <= 2 && noise < 151) value = 0
            matrix.set(point, value)
        }
        new ScanlineFill(group.origin, onFill, canFill).fill()
    })
    return matrix
}
