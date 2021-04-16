import { Matrix } from '/lib/base/matrix'
import { Color } from '/lib/base/color'
import { Point } from '/lib/base/point'
import { SimplexNoise } from '/lib/fractal/noise'
import { ScanlineFill } from '/lib/floodfill/scanline'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'

/*
TODO
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/

const OCEANIC_TYPE = 'O'
const CONTINENTAL_TYPE = 'C'
const SHIELD_TYPE = 'S'
const NO_DEFORMATION = null
const OROGENY = 1
const TRENCH = 2
const RIFT = 3
const EMPTY = null


export class Tectonics {
    constructor(seed, params) {
        const regionGroupTileMap = buildRegionGroupMap(seed, params)
        const index = buildPlateIndex(regionGroupTileMap)
        const noiseMap = new NoiseMap()
        this.geologyMatrix = buildGeoMatrix(index, regionGroupTileMap, noiseMap)
        this.regionGroupTileMap = regionGroupTileMap
        this.index = index
    }

    getPlateCount() {
        return this.index.size
    }

    getPlate(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        return this.index.get(group.id)
    }

    getGeology(point) {
        return this.geologyMatrix.get(point)
    }

    isPlateBorder(point) {
        return this.regionGroupTileMap.isGroupBorderPoint(point)
    }

    map(callback) {
        return Array.from(this.index.values()).map(callback)
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
        return this.type === OCEANIC_TYPE
    }

    isShield() {
        return this.type === SHIELD_TYPE
    }
}


function buildRegionGroupMap(seed, params) {
    return RegionGroupTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: seed,
        groupScale: params.get('scale'),
        groupChance: 0.2,
        groupGrowth: 20,
        scale: 1,
        growth: 0,
        chance: 0.1,
    })
}


function buildPlateIndex(regionGroupTileMap) {
    const halfMapArea = Math.floor(regionGroupTileMap.area / 2)
    const index = new Map()
    let hasShield = false
    let oceanicArea = 0
    regionGroupTileMap.getGroupsDescOrder().forEach(group => {
        oceanicArea += group.area
        let type = oceanicArea < halfMapArea ? OCEANIC_TYPE : CONTINENTAL_TYPE
        if (type === CONTINENTAL_TYPE && ! hasShield) {
            type = SHIELD_TYPE
            hasShield = true
        }
        const plate = new Plate(group.id, type, group.area)
        index.set(group.id, plate)
    })
    return index
}


function buildGeoMatrix(plateIndex, groupTilemap, noiseMap) {
    const {width, height} = groupTilemap
    const matrix = new Matrix(width, height, () => EMPTY)

    groupTilemap.forEach(group => {
        const plate = plateIndex.get(group.id)
        const canFill = point => {
            const currentGroup = groupTilemap.getGroup(point)
            const isSameGroup = group.id === currentGroup.id
            return isSameGroup && matrix.get(point) === EMPTY
        }

        const onFill = point => {
            const region = groupTilemap.getRegion(point)
            const layer = groupTilemap.getGroupLayer(region)
            const noiseValue = noiseMap.get(point)
            const coastValue = noiseMap.getCoast(point)

            let value = 1 // land
            if (plate.isOceanic()) {
                const deep = layer === 0 ? 3 : 0
                value = layer > 0 && noiseValue < 20 ? 1 : deep
            } else if (plate.isShield()) {
                value = 1
            } else if (layer === 0) {
                const deform = plate.id % 2 === 0 ? 2 : 0
                value = coastValue > 80 ? deform : 1
            }

            matrix.set(point, value)
        }

        const filterPoint = point => matrix.wrap(point)

        new ScanlineFill(group.origin, onFill, canFill, filterPoint).fill()
    })

    return matrix
}


class NoiseMap {
    constructor() {
        this.default = new SimplexNoise(6, 0.8, 0.02)
        this.coast   = new SimplexNoise(7, 0.6, 0.04)
    }

    get(point) {
        return this.default.get(point)
    }

    getCoast(point) {
        return this.coast.get(point)
    }
}


class ScanlineFillConfig {
    constructor(params) {
        this.matrix = params.matrix

    }

    canFill(point) {
        const currentGroup = groupTilemap.getGroup(point)
        const isSameGroup = group.id === currentGroup.id
        return isSameGroup && this.matrix.get(point) === EMPTY
    }

    onFill(point) {
        const region = groupTilemap.getRegion(point)
        const layer = groupTilemap.getGroupLayer(region)
        const noiseValue = noise.get(point)
        const coastValue = coastNoise.get(point)

        let value = 1 // land
        if (plate.isOceanic()) {
            value = layer > 0 && noiseValue < 20 ? 1 : 0
        } else if (plate.isShield()) {
            value = 1
        } else if (layer === 0) {
            value = coastValue > 80 ? 2 : 1
        }

        this.matrix.set(point, value)
    }
}

