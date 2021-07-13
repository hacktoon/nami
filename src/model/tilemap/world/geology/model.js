import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { SimplexNoise } from '/lib/fractal/noise'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { BoundaryMap } from './boundary'
import { PlateMap } from './plate'


export class GeologyModel {
    constructor(seed, params) {
        this.regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        this.plates = new PlateMap(this.regionGroupTileMap)
        this.stressLevels = new Map()
        this.regionBoundary = new Map()

        const boundaryMap = new BoundaryMap(this.plates, this.regionGroupTileMap)
        const fills = this.regionGroupTileMap.getBorderRegions().map(region => {
            const group = this.regionGroupTileMap.getGroupByRegion(region)
            const boundary = this._buildPlateBoundary(boundaryMap, group, region)
            const fillConfig = new BoundaryRegionFillConfig({
                regionGroupTileMap: this.regionGroupTileMap,
                regionBoundary: this.regionBoundary,
                stressLevels: this.stressLevels,
                id: group.id,
                boundary,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()
    }

    _buildRegionGroupMap(seed, params) {
        return RegionGroupTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            seed: seed,
            groupScale: params.get('scale'),
            groupGrowth: params.get('growth'),
            groupChance: .1,
            scale: 1,
            growth: 0,
            chance: .1,
        })
    }

    _buildPlateBoundary(boundaryMap, group, region) {
        let boundary
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
        return this.plates.map(plate => callback(plate))
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
        this.data = data

        this.chance = data.boundary.chance
        this.growth = data.boundary.growth
    }

    isEmpty(region) {
        return !this.data.regionBoundary.has(region.id)
    }

    setValue(region, level) {
        this.data.regionBoundary.set(region.id, this.data.boundary)
        this.data.stressLevels.set(region.id, level)
    }

    getNeighbors(region) {
        return this.data.regionGroupTileMap.getNeighborRegions(region)
    }
}

