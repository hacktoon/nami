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
        const borders = buildPlateBorders(regionGroupTileMap, index)
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

    isContinental() {
        return this.type === CONTINENTAL_TYPE
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


function buildPlateBorders(regionGroupTileMap, plateIndex) {
    const map = new Map()
    regionGroupTileMap.forEach(group => {
        const plate = plateIndex.get(group.id)
        const edges = regionGroupTileMap.graph.getEdges(group.id)
        console.log(plate);
        // console.log(`${group.id} => ${edges}`);
    })
}


function buildGeoMatrix(plateIndex, groupTilemap, noiseMap) {
    const {width, height} = groupTilemap
    const matrix = new Matrix(width, height, () => EMPTY)

    groupTilemap.forEach(group => {
        const plate = plateIndex.get(group.id)
        const config = new PlateFillConfig({
            plate, group, matrix, groupTilemap, noiseMap
        })
        new ScanlineFill(group.origin, config).fill()
    })
    return matrix
}


class PlateFillConfig {
    constructor(config) {
        this.groupTilemap = config.groupTilemap
        this.noiseMap = config.noiseMap
        this.matrix = config.matrix
        this.plate = config.plate
        this.group = config.group
    }

    canFill(point) {
        const currentGroup = this.groupTilemap.getGroup(point)
        const isSameGroup = this.group.id === currentGroup.id
        return isSameGroup && this.matrix.get(point) === EMPTY
    }

    onFill(point) {
        const region = this.groupTilemap.getRegion(point)
        const layer = this.groupTilemap.getRegionLayer(region)
        const noiseValue = this.noiseMap.get(point)
        const coastValue = this.noiseMap.getCoast(point)

        let value = 1 // land
        if (this.plate.isOceanic()) {
            const deep = layer === 0 ? 3 : 0
            value = layer > 0 && noiseValue < 20 ? 1 : deep
        } else if (this.plate.isShield()) {
            value = 1
        } else if (layer === 0) {
            const deform = this.plate.id % 2 === 0 ? 2 : 0
            value = coastValue > 80 ? deform : 1
        }

        this.matrix.set(point, value)
    }

    filterPoint(point) {
        return this.matrix.wrap(point)
    }
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

