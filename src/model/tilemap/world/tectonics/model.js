import { PairMap } from '/lib/base'
import { Random } from '/lib/base/random'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { Direction } from '/lib/base/direction'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { Boundary } from './boundary'


const TYPE_OCEANIC = 'O'
const TYPE_CONTINENTAL = 'C'


export class Plate {
    constructor(id, origin, type, area) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
        this.speed = Random.choice(1, 1, 1, 2, 2, 3)
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
        this.stress = data.stress
    }

    _build(seed, params) {
        const regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        const plates = this._buildPlates(regionGroupTileMap)
        const boundaries = new Map()
        const stress = new Map()
        const visitedRegions = new Set()
        const borderRegions = regionGroupTileMap.getBorderRegions()
        const fills = borderRegions.map(region => {
            const group = regionGroupTileMap.getGroupByRegion(region)
            const fillConfig = new BoundaryRegionFillConfig({
                id: group.id,
                boundaries,
                stress,
                regionGroupTileMap,
                visitedRegions,
                plates,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()

        return {regionGroupTileMap, plates, boundaries, stress}
    }

    _buildRegionGroupMap(seed, params) {
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


class BoundaryRegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.id = data.id
        this.regionGroups = data.regionGroupTileMap
        this.visitedRegions = data.visitedRegions
        this.plate = data.plates.get(data.id)
        this.boundaries = data.boundaries
        this.plates = data.plates
        this.stress = data.stress
        this.energy = this.plate.speed
        this.chance = .5
        this.growth = 2
    }

    isEmpty(region) {
        return !this.visitedRegions.has(region.id)
    }

    setValue(region, level) {
        this.visitedRegions.add(region.id)
        this.stress.set(region.id, level)
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
            let boundary
            if (Direction.converge(this.plate.direction, regionsDir)) {
                boundary = this._buildConvergentBoundary(this.plate, neighborPlate)
            } else if (Direction.diverge(this.plate.direction, regionsDir)) {
                boundary = this._buildDivergentBoundary(this.plate, neighborPlate)
            } else {
                boundary = this._buildTransformBoundary(this.plate, neighborPlate)
            }
            this.boundaries.set(region.id, boundary)
        }
    }

    _buildConvergentBoundary(plate, other) {
        if (plate.isContinental()) {
            return Boundary.OROGENY
        }
        if (other.isOceanic()) {
            return Boundary.ISLAND_ARC
        }
        return Boundary.OCEANIC_TRENCH
    }

    _buildDivergentBoundary(plate, other) {
        if (plate.isContinental()) {
            if (other.isOceanic())
                return Boundary.PASSIVE_MARGIN
            if (other.isContinental())
                return Boundary.CONTINENTAL_RIFT
        }
        return Boundary.OCEANIC_RIFT
    }

    _buildTransformBoundary(plate, other) {
        if (plate.speed != other.speed) {
            if (plate.isOceanic()) return Boundary.OCEANIC_FAULT
            return Boundary.TRANSFORM_FAULT
        }
        return Boundary.NONE
    }

    getNeighbors(region) {
        return this.regionGroups.getNeighborRegions(region)
    }
}


class RegionBoundaryMap {
    constructor(plates, regionGroupTileMap) {

    }

    has(regionId) {
        return this.boundaries.has(regionId)
    }
}
