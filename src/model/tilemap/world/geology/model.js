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
        this.stressMap = new Map()
        this.deformRegionMap = new Map()
        this.maxStressMap = new Map()
        this._build()
    }

    _build() {
        const deformMap = new DeformMap(this.plates, this.regionGroupTileMap)
        const fills = this.regionGroupTileMap.getBorderRegions().map(region => {
            const group = this.regionGroupTileMap.getGroupByRegion(region)
            const deform = this._buildPlateDeform(deformMap, group, region)
            const fillConfig = new DeformRegionFillConfig({
                regionGroupTileMap: this.regionGroupTileMap,
                deformRegionMap: this.deformRegionMap,
                stressMap: this.stressMap,
                maxStressMap: this.maxStressMap,
                deform,
                group
            })
            this.maxStressMap.set(group.id, 0)
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

    isMaxStress(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        const group = this.regionGroupTileMap.getGroup(point)
        const stress = this.stressMap.get(region.id)
        const isMaxStress = stress === this.maxStressMap.get(group.id)
        return isMaxStress && region.id % 2
    }
}


class DeformRegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap
        this.deformRegionMap = data.deformRegionMap
        this.maxStressMap = data.maxStressMap
        this.stressMap = data.stressMap
        this.deform = data.deform
        this.group = data.group

        this.chance = data.deform.chance
        this.growth = data.deform.growth
    }

    isEmpty(region) {
        return !this.stressMap.has(region.id)
    }

    setValue(region, level) {
        const stress = this.maxStressMap.get(this.group.id)
        if (level > stress) this.maxStressMap.set(this.group.id, level)
        if (level >= this.deform.depth && level < this.deform.energy) {
            this.deformRegionMap.set(region.id, this.deform)
        }
        this.stressMap.set(region.id, level)
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
