import { Color } from '/lib/base/color'
import { Random } from '/lib/base/random'
import { Direction } from '/lib/base/direction'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { buildGeoMatrix } from './matrix'

/*
TODO
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/

const NO_DEFORMATION = null
export const DEFORMATION_OROGENY = 1
export const DEFORMATION_TRENCH = 2
export const DEFORMATION_RIFT = 3
export const DEFORMATION_CONTINENTAL_RIFT = 4
export const DEFORMATION_ISLAND_ARC = 5
export const DEFORMATION_PASSIVE_MARGIN = 6

const EMPTY = null

const TYPE_OCEANIC = 'O'
const TYPE_CONTINENTAL = 'C'


export class Plate {
    constructor(id, type, origin, area) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
        this.speed = Random.choice(1, 1, 2, 2, 3)
    }

    isOceanic() {
        return this.type === TYPE_OCEANIC
    }

    isContinental() {
        return this.type === TYPE_CONTINENTAL
    }
}


export class TectonicsModel {
    constructor(seed, params) {
        const data = this._build(seed, params)
        this.regionGroupTileMap = data.regionGroupTileMap
        this.deformations = data.deformations
        this.plates = data.plates
    }

    _build(seed, params) {
        const regionGroupTileMap = buildRegionGroupMap(seed, params)
        const plates = this._buildPlates(regionGroupTileMap)
        const deformations = new BoundaryMap(plates, regionGroupTileMap)

        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()

        return {regionGroupTileMap, plates, deformations}
    }

    _buildPlates(regionGroupTileMap) {
        const plates = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = regionGroupTileMap.getGroups().sort(cmpDescendingCount)
        const halfWorldArea = Math.floor(regionGroupTileMap.area / 2)
        let oceanicArea = 0
        groups.forEach(group => {
            oceanicArea += group.area
            let type = TYPE_CONTINENTAL
            if (oceanicArea < halfWorldArea)
                type = TYPE_OCEANIC
            const plate = new Plate(group.id, type, group.origin, group.area)
            plates.set(plate.id, plate)
        })
        return plates
    }

    map(callback) {
        return Array.from(this.plates.values()).map(callback)
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }
}


function buildRegionGroupMap(seed, params) {
    return RegionGroupTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: seed,
        groupScale: params.get('scale'),
        groupGrowth: params.get('growth'),
        groupChance: 0.1,
        scale: 2,
        growth: 0,
        chance: 0.1,
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


class BoundaryMap {
    constructor(plates, regionGroupTileMap) {
        const graph = regionGroupTileMap.getGraph()
        this.boundaries = new Map()
        plates.forEach(plate => {
            const neighborMap = new Map()
            graph.getEdges(plate.id).forEach(id => {
                const neighborPlate = plates.get(id)
                const deformation =this._buildBoundary(plate, neighborPlate)
                neighborMap.set(neighborPlate.id, deformation)
            })
            this.boundaries.set(plate.id, neighborMap)
        })
    }

    _buildBoundary(plate, otherPlate) {
        if (plate.isContinental()) {
            return this._builContinentaldBoundary(plate, otherPlate)
        }
        return this._builOceanicBoundary(plate, otherPlate)
    }

    _builContinentaldBoundary(plate, otherPlate) {
        if (otherPlate.isContinental()) {
            if (plate.speed > otherPlate.speed)
                return DEFORMATION_OROGENY
            return NO_DEFORMATION
        }
        if (otherPlate.isOceanic()) {
            if (plate.id % 2 === 0) {
                return DEFORMATION_PASSIVE_MARGIN
            }
            return DEFORMATION_OROGENY
        }
    }

    _builOceanicBoundary(plate, otherPlate) {
        if (otherPlate.isContinental()) {
            return DEFORMATION_TRENCH
        }
        if (otherPlate.isOceanic()) {
            return DEFORMATION_TRENCH
        }
    }

    get(groupId) {
        return this.boundaries.get(groupId)
    }
}

