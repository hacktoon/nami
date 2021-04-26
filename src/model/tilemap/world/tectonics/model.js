import { Color } from '/lib/base/color'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { buildGeoMatrix } from './matrix'

/*
TODO
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/

const OCEANIC_TYPE = 'O'
const CONTINENTAL_TYPE = 'C'
const SHIELD_TYPE = 'S'


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
        groupGrowth: 36,
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

