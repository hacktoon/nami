import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { SimplexNoise } from '/lib/fractal/noise'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { DeformMap } from './deform'
import { PlateMap } from './plate'


export class DeformModel {
    constructor(seed, params) {
        this.regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        this.plates = new PlateMap(this.regionGroupTileMap)
        this.stressLevels = new Map()
        this.deformRegions = new Map()
        this._build()
    }

    _build() {
        const deformMap = new DeformMap(this.plates, this.regionGroupTileMap)
        const fills = this.regionGroupTileMap.getBorderRegions().map(region => {
            const group = this.regionGroupTileMap.getGroupByRegion(region)
            const deform = this._buildPlateDeform(deformMap, group, region)
            const fillConfig = new DeformRegionFillConfig({
                regionGroupTileMap: this.regionGroupTileMap,
                deformRegions: this.deformRegions,
                stressLevels: this.stressLevels,
                deform,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
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

    _buildPlateDeform(deformMap, group, region) {
        const neighborRegions = this.regionGroupTileMap.getNeighborRegions(region)
        for(let neighbor of neighborRegions) {
            const neighborGroup = this.regionGroupTileMap.getGroupByRegion(neighbor)
            if (neighborGroup.id !== group.id) {
                return deformMap.get(region, neighbor)
            }
        }
    }
}


class DeformRegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap
        this.deformRegions = data.deformRegions
        this.stressLevels = data.stressLevels
        this.deform = data.deform

        this.chance = data.deform.chance
        this.growth = data.deform.growth
    }

    isEmpty(region) {
        return !this.stressLevels.has(region.id)
    }

    setValue(region, level) {
        this.stressLevels.set(region.id, level)
        if (level >= this.deform.depth && level < this.deform.energy) {
            this.deformRegions.set(region.id, this.deform)
        }
    }

    getNeighbors(region) {
        return this.regionGroupTileMap.getNeighborRegions(region)
    }
}


class FeatureModel {
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
