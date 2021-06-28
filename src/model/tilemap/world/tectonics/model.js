import { Random } from '/lib/base/random'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { Direction } from '/lib/base/direction'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { Boundary, BoundaryMap } from './boundary'


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
        this.weight = Random.choice(1, 1, 2, 2, 3)
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
        this.regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        const data = this._build()
        this.plates = data.plates
        this.stressLevels = data.stressLevels
        this.regionBoundary = data.regionBoundary
    }

    _build() {
        const plates = this._buildPlates()
        const boundaryMap = new BoundaryMap(plates, this.regionGroupTileMap)
        const regionBoundary = new Map()
        const stressLevels = new Map()
        const fills = this.regionGroupTileMap.getBorderRegions().map(region => {
            const group = this.regionGroupTileMap.getGroupByRegion(region)
            const boundary = this._buildPlateBoundary(boundaryMap, group, region)
            const fillConfig = new BoundaryRegionFillConfig({
                id: group.id,
                regionGroupTileMap: this.regionGroupTileMap,
                regionBoundary,
                boundary,
                stressLevels,
                plates,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()

        return {plates, regionBoundary, stressLevels}
    }

    _buildRegionGroupMap(seed, params) {
        return RegionGroupTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            seed: seed,
            groupScale: params.get('scale'),
            groupGrowth: params.get('growth'),
            groupChance: 0.1,
            scale: 1,
            growth: 0,
            chance: 0.1,
        })
    }

    _buildPlates() {
        const plates = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = this.regionGroupTileMap.getGroups().sort(cmpDescendingCount)
        const typeMap = this._buildPlateTypes(groups)
        groups.forEach(group => {
            const neighborsGroups = this.regionGroupTileMap.getNeighborGroups(group)
            const isLandlocked = neighborsGroups.concat(group).every(neighbor => {
                return typeMap.get(neighbor.id) === TYPE_CONTINENTAL
            })
            const type = isLandlocked ? TYPE_OCEANIC : typeMap.get(group.id)
            const plate = new Plate(group.id, group.origin, type, group.area)
            plates.set(plate.id, plate)
        })
        return plates
    }

    _buildPlateTypes(groups) {
        const halfWorldArea = Math.floor(this.regionGroupTileMap.area / 2)
        const typeMap = new Map()
        let totalOceanicArea = 0
        groups.forEach(group => {
            totalOceanicArea += group.area
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            typeMap.set(group.id, type)
        })
        return typeMap
    }

    _buildPlateBoundary(boundaryMap, group, region) {
        let boundary = Boundary.NONE
        const neighborRegions = this.regionGroupTileMap.getNeighborRegions(region)
        for(let neighbor of neighborRegions) {
            const neighborGroup = this.regionGroupTileMap.getGroupByRegion(neighbor)
            if (neighborGroup.id !== group.id) {
                boundary = boundaryMap.get(region, neighbor)
            }
        }
        return boundary
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
        this.boundary = data.boundary
        this.data = data

        this.chance = .2
        this.growth = 1
    }

    isEmpty(region) {
        return !this.data.regionBoundary.has(region.id)
    }

    setValue(region, level) {
        this.data.regionBoundary.set(region.id, this.boundary)
        this.data.stressLevels.set(region.id, level)
    }

    getNeighbors(region) {
        return this.data.regionGroupTileMap.getNeighborRegions(region)
    }
}

