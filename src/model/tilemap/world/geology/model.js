import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { BoundaryModel } from './boundary'
import { PlateMap } from './plate'


export class PlateModel {
    constructor(seed, params) {
        this.regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        this.plates = new PlateMap(this.regionGroupTileMap)
        this.stressMap = new Map()
        this.regionLandformMap = new Map()
        this.maxStressMap = new Map()
        this.heightIndex = new HeightIndex()
        this._build()
    }

    _build() {
        const regionGroup = this.regionGroupTileMap
        const boundaryModel = new BoundaryModel(this.plates, regionGroup)
        const borderRegions = regionGroup.getBorderRegions()
        const fills = borderRegions.map(region => {
            const group = regionGroup.getGroupByRegion(region)
            const boundary = this._buildPlateBoundary(boundaryModel, group, region)
            const fillConfig = new RegionFillConfig({
                regionGroupTileMap: regionGroup,
                regionLandformMap: this.regionLandformMap,
                maxStressMap: this.maxStressMap,
                stressMap: this.stressMap,
                heightIndex: this.heightIndex,
                boundary,
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
            groupScale: params.get('scale'),
            groupGrowth: params.get('growth'),
            groupChance: .1,
            seed: seed,
            chance: .1,
            growth: 0,
            scale: 1,
        })
    }

    _buildPlateBoundary(boundaryModel, group, region) {
        const neighborRegions = this.regionGroupTileMap.getNeighborRegions(region)
        for(let neighbor of neighborRegions) {
            const neighborGroup = this.regionGroupTileMap.getGroupByRegion(neighbor)
            if (neighborGroup.id !== group.id) {
                return boundaryModel.get(group, neighborGroup)
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


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap
        this.regionLandformMap = data.regionLandformMap
        this.maxStressMap = data.maxStressMap
        this.heightIndex = data.heightIndex
        this.stressMap = data.stressMap
        this.boundary = data.boundary
        this.group = data.group

        this.chance = data.boundary.chance
        this.growth = data.boundary.growth
    }

    isEmpty(neighborRegion) {
        return !this.stressMap.has(neighborRegion.id)
    }

    setValue(region, level) {
        const stress = this.maxStressMap.get(this.group.id)
        const landform = this.boundary.get(level)
        if (level > stress) {
            this.maxStressMap.set(this.group.id, level)
        }
        this.heightIndex.set(landform, region.id)
        this.regionLandformMap.set(region.id, landform)
        this.stressMap.set(region.id, level)
    }

    getNeighbors(region) {
        return this.regionGroupTileMap.getNeighborRegions(region)
    }
}


class HeightIndex {
    // for each height, stores all region ids in that height
    constructor() {
        this.map = new Map()
    }

    set(landform, regionId) {
        if (! this.map.has(landform.name)) {
            this.map.set(landform.name, [])
        }
        const regions = this.map.get(landform.name)
        regions.push(regionId)
    }

    get(landform) {
        return this.map.get(landform.name)
    }
}
