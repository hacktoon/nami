import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { DeformMap } from './deform'
import { PlateMap } from './plate'


export class DeformModel {
    constructor(seed, params) {
        this.regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        this.plates = new PlateMap(this.regionGroupTileMap)
        this.stressMap = new Map()
        this.regionLandformMap = new Map()
        this.maxStressMap = new Map()
        this.coastMap = new Map()
        this._build()
    }

    _build() {
        const deformMap = new DeformMap(this.plates, this.regionGroupTileMap)
        const borderRegions = this.regionGroupTileMap.getBorderRegions()
        const fills = borderRegions.map(region => {
            const group = this.regionGroupTileMap.getGroupByRegion(region)
            const deform = this._buildPlateDeform(deformMap, group, region)
            const fillConfig = new DeformRegionFillConfig({
                regionGroupTileMap: this.regionGroupTileMap,
                regionLandformMap: this.regionLandformMap,
                maxStressMap: this.maxStressMap,
                stressMap: this.stressMap,
                coastMap: this.coastMap,
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
                return deformMap.get(group, neighborGroup)
            }
        }
    }

    isMaxStress(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        const group = this.regionGroupTileMap.getGroup(point)
        const stress = this.stressMap.get(region.id)
        return stress === this.maxStressMap.get(group.id)
    }
}


class DeformRegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap
        this.regionLandformMap = data.regionLandformMap
        this.maxStressMap = data.maxStressMap
        this.stressMap = data.stressMap
        this.deform = data.deform
        this.group = data.group

        this.chance = data.deform.chance
        this.growth = data.deform.growth
    }

    isEmpty(neighborRegion) {
        return !this.stressMap.has(neighborRegion.id)
    }

    setValue(region, level) {
        const stress = this.maxStressMap.get(this.group.id)
        const landform = this.deform.get(level)
        if (level > stress) {
            this.maxStressMap.set(this.group.id, level)
        }
        this.regionLandformMap.set(region.id, landform)
        this.stressMap.set(region.id, level)
    }

    getNeighbors(region) {
        return this.regionGroupTileMap.getNeighborRegions(region)
    }
}
