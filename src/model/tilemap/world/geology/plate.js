import { Direction } from '/lib/base/direction'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { BoundaryModel } from './boundary'
import { ErosionModel } from './erosion'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'


export class PlateModel {
    constructor(regionGroupTileMap) {
        this.regionGroupTileMap = regionGroupTileMap
        this.plateMap = new PlateMap(regionGroupTileMap)
        this.landformMap = new Map()
        this._build()
    }

    _build() {
        const regionGroup = this.regionGroupTileMap
        const boundaryModel = new BoundaryModel(this.plateMap, regionGroup)
        const borderRegions = regionGroup.getBorderRegions()
        const fills = borderRegions.map(region => {
            const group = regionGroup.getGroupByRegion(region)
            const boundary = this._buildPlateBoundary(boundaryModel, group, region)
            const fillConfig = new RegionFillConfig({
                regionGroupTileMap: regionGroup,
                landformMap: this.landformMap,
                boundary,
                group
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
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
}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap
        this.landformMap = data.landformMap
        this.heightIndex = data.heightIndex
        this.boundary = data.boundary
        this.group = data.group

        this.chance = data.boundary.chance
        this.growth = data.boundary.growth
    }

    isEmpty(neighborRegion) {
        return !this.landformMap.has(neighborRegion.id)
    }

    setValue(region, level) {
        const landform = this.boundary.getLandform(level)
        this.landformMap.set(region.id, landform)
    }

    getNeighbors(region) {
        return this.regionGroupTileMap.getNeighborRegions(region)
    }
}


export class PlateMap {
    constructor(regionGroupTileMap) {
        this.regionGroupTileMap = regionGroupTileMap
        this.map = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = this.regionGroupTileMap.getGroups().sort(cmpDescendingCount)
        const typeMap = this._buildTypes(groups)
        groups.forEach(group => {
            const {id, origin, area} = group
            const neighborsGroups = this.regionGroupTileMap.getNeighborGroups(group)
            const isLandlocked = neighborsGroups.concat(group).every(neighbor => {
                return typeMap.get(neighbor.id) === TYPE_CONTINENTAL
            })
            const type = isLandlocked ? TYPE_OCEANIC : typeMap.get(id)
            const weight = id + (type === TYPE_OCEANIC ? groups.length * 10 : 0)
            const plate = new Plate(id, origin, type, area, weight)
            this.map.set(plate.id, plate)
        })
    }

    _buildTypes(groups) {
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

    get size() {
        return this.map.size
    }

    get(id) {
        return this.map.get(id)
    }

    map(callback) {
        return Array.from(this.map.values()).map(plate => callback(plate))
    }

    forEach(callback) {
        this.map.forEach(callback)
    }
}


class Plate {
    constructor(id, origin, type, area, weight) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
        this.weight = weight
        this.color = type === TYPE_OCEANIC ? '#058' : '#574'
    }

    isOceanic() {
        return this.type === TYPE_OCEANIC
    }

    isContinental() {
        return this.type === TYPE_CONTINENTAL
    }
}
