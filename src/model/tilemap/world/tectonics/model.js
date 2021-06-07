import { Random } from '/lib/base/random'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { Direction } from '/lib/base/direction'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'


const NO_DEFORMATION = null
export const DEFORMATION_OROGENY = 1
export const DEFORMATION_TRENCH = 2
export const DEFORMATION_RIFT = 3
export const DEFORMATION_CONTINENTAL_RIFT = 4
export const DEFORMATION_ISLAND_ARC = 5
export const DEFORMATION_PASSIVE_MARGIN = 6
export const DEFORMATION_FAULT = 7
export const DEFORMATION_OCEANIC_FAULT = 8

const TYPE_OCEANIC = 'O'
const TYPE_CONTINENTAL = 'C'


export class Plate {
    constructor(id, origin, type, area) {
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
        this.boundaries = data.boundaries
        this.plates = data.plates
    }

    _build(seed, params) {
        const regionGroupTileMap = buildRegionGroupMap(seed, params)
        const plates = this._buildPlates(regionGroupTileMap)
        const boundaries = new RegionBoundaryMap(plates, regionGroupTileMap)

        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()

        return {regionGroupTileMap, plates, boundaries}
    }

    _buildPlates(regionGroupTileMap) {
        const plates = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = regionGroupTileMap.getGroups().sort(cmpDescendingCount)
        const halfWorldArea = Math.floor(regionGroupTileMap.area / 2)
        let totalOceanicArea = 0
        groups.forEach(group => {
            totalOceanicArea += group.area
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            const plate = new Plate(group.id, group.origin, type, group.area)
            plates.set(plate.id, plate)
        })
        return plates
    }

    map(callback) {
        return Array.from(this.plates.values()).map(plate => callback(plate))
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


class RegionBoundaryMap {
    constructor(plates, regionGroupTileMap) {
        this.boundaries = new Map()
        const visitedRegions = new Set()
        const borderRegions = regionGroupTileMap.getBorderRegions()
        const fills = borderRegions.map(region => {
            const group = regionGroupTileMap.getGroupByRegion(region)
            const fillConfig = new BoundaryRegionFillConfig({
                id: group.id,
                boundaries: this.boundaries,
                regionGroupTileMap,
                visitedRegions,
                plates,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
    }

    has(regionId) {
        return this.boundaries.has(regionId)
    }

    get(regionId) {
        return this.boundaries.get(regionId)
    }
}


class BoundaryRegionFillConfig {
    constructor(data) {
        this.id = data.id
        this.regionGroups = data.regionGroupTileMap
        this.visitedRegions = data.visitedRegions
        this.plate = data.plates.get(data.id)
        this.boundaries = data.boundaries
        this.plates = data.plates
        this.energy = this.plate.speed
        this.chance = .1
        this.growth = 2
    }

    isEmpty(region) {
        return !this.visitedRegions.has(region.id)
    }

    setValue(region) {
        this.visitedRegions.add(region.id)
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.regionGroups.getGroupByRegion(neighborRegion)
        if (neighborGroup.id === this.id) {
            if (this.boundaries.has(region.id) && this.energy > 0) {
                const boundary = this.boundaries.get(region.id)
                this.energy--
                this.boundaries.set(neighborRegion.id, boundary)
            }
        } else {
            const neighborPlate = this.plates.get(neighborGroup.id)
            const regionsDir = this.regionGroups.getRegionDirection(region, neighborRegion)
            let boundary = this._buildTransformBoundary(this.plate, neighborPlate)
            if (Direction.converge(this.plate.direction, regionsDir)) {
                boundary = this._buildConvergentBoundary(this.plate, neighborPlate)
            } else if (Direction.diverge(this.plate.direction, regionsDir)) {
                boundary = this._buildDivergentBoundary(this.plate, neighborPlate)
            }
            this.boundaries.set(region.id, boundary)
        }
    }

    _buildConvergentBoundary(plate, other) {
        if (plate.isContinental()) {
            return DEFORMATION_OROGENY
        }
        if (other.isOceanic()) {
            return DEFORMATION_ISLAND_ARC
        }
        if (other.isContinental()) {
            return DEFORMATION_TRENCH
        }
    }

    _buildDivergentBoundary(plate, other) {
        if (plate.isContinental()) {
            if (other.isOceanic())
                return DEFORMATION_PASSIVE_MARGIN
            if (other.isContinental())
                return DEFORMATION_CONTINENTAL_RIFT
        }
        return DEFORMATION_RIFT
    }

    _buildTransformBoundary(plate, other) {
        if (plate.speed != other.speed) {
            if (plate.isOceanic()) return DEFORMATION_OCEANIC_FAULT
            return DEFORMATION_FAULT
        }
        return NO_DEFORMATION
    }

    getNeighbors(region) {
        return this.regionGroups.getNeighborRegions(region)
    }
}
