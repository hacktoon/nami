import { Matrix } from '/lib/base/matrix'
import { Color } from '/lib/base/color'
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
        this.index = buildPlateIndex(regionGroupTileMap)
        this.geologicMatrix = buildGeologicMatrix(this.index, regionGroupTileMap)
        this.regionGroupTileMap = regionGroupTileMap
    }

    getPlate(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        return this.index.get(group.id)
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
        return this.type == OCEANIC_TYPE
    }

    isShield() {
        return this.type == SHIELD_TYPE
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
        scale: 2,
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
        if (! hasShield && type === CONTINENTAL_TYPE) {
            hasShield = true
            type = SHIELD_TYPE
        }
        const plate = new Plate(group.id, type, group.area)
        index.set(group.id, plate)
    })
    return index
}


const provinceMap = {}  // border regions depending on continents position must be islands


function buildGeologicMatrix(plateIndex, rgTilemap) {
    const {width, height} = rgTilemap
    const matrix = new Matrix(width, height, () => EMPTY)
    const noise = new SimplexNoise(6, 0.8, 0.02)
    const coastNoise = new SimplexNoise(8, 0.8, 0.04)

    rgTilemap.forEach(group => {
        const plate = plateIndex.get(group.id)
        const canFill = point => {
            const currentGroup = rgTilemap.getGroup(point)
            const isSameGroup = group.id === currentGroup.id
            return isSameGroup && matrix.get(point) === EMPTY
        }

        const onFill = point => {
            const region = rgTilemap.getRegion(point)
            const layer = rgTilemap.getGroupLayer(region)
            const noiseValue = noise.get(point)
            const coastValue = coastNoise.get(point)

            let value = 1 // land
            if (plate.isOceanic()) {
                value = noiseValue < 20 ? 1 : 0
            } else if (plate.isShield()) {
                value = 1
            } else if (layer === 0) {
                value = coastValue > 80 ? 2 : 1
            }

            matrix.set(point, value)
        }

        const filterPoint = point => matrix.wrap(point)

        new ScanlineFill(group.origin, onFill, canFill, filterPoint).fill()
    })

    return matrix
}


