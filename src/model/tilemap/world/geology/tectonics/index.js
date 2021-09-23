import { Direction } from '/lib/base/direction'
import { Point } from '/lib/base/point'
import { Random } from '/lib/base/random'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { BoundaryModel } from './boundary'
import { Landform } from '../landform'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class TectonicsModel {
    constructor(regionGroup) {
        this.regionGroup = regionGroup
        this.plateMap = new PlateMap(regionGroup)
        this.landformMap = new Map()
        this.boundaryMap = new Map()
        this._buildLandforms()
        this._buildHotspots()
    }

    _buildLandforms() {
        const boundaryModel = new BoundaryModel(this.plateMap, this.regionGroup)
        const borderRegions = this.regionGroup.getBorderRegions()
        const fills = borderRegions.map(region => {
            const group = this.regionGroup.getGroupByRegion(region)
            const boundary = this._buildPlateBoundary(boundaryModel, group, region)
            const fillConfig = new RegionFillConfig({
                regionGroup: this.regionGroup,
                landformMap: this.landformMap,
                boundaryMap: this.boundaryMap,
                boundary,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
    }

    _buildPlateBoundary(boundaryModel, group, region) {
        const neighborRegions = this.regionGroup.getNeighborRegions(region)
        for(let neighbor of neighborRegions) {
            const neighborGroup = this.regionGroup.getGroupByRegion(neighbor)
            if (neighborGroup.id !== group.id) {
                return boundaryModel.get(group, neighborGroup)
            }
        }
    }

    _buildHotspots() {
        this.plateMap.forEach(plate => {
            if (! plate.hasHotspot) return
            if (plate.isOceanic()) {
                const points = this._buildHotspotPoints(plate)
                for (let point of points) {
                    const region = this.regionGroup.getRegion(point)
                    const current = this.landformMap.get(region.id)
                    if (current.water) {
                        const landform = Landform.getOceanicHotspot()
                        this.landformMap.set(region.id, landform)
                    }
                }
            } else {
                const region = this.regionGroup.getRegion(plate.origin)
                const current = this.landformMap.get(region.id)
                if (! current.water) {
                    const landform = Landform.getContinentalHotspot()
                    this.landformMap.set(region.id, landform)
                }
            }
        })
    }

    _buildHotspotPoints(plate) {
        const count = Random.choice(2, 3)
        const size = this.regionGroup.getAverageRegionArea()
        const offsets = []
        const xSig = Random.choice(-1, 1)
        const ySig = Random.choice(-1, 1)
        for (let i = 1; i <= count; i++) {
            const point = [size + i * xSig, size + i * ySig]
            offsets.push(point)
        }
        const points = [plate.origin]
        let current = plate.origin
        offsets.forEach(point => {
            current = Point.plus(current, point)
            points.push(current)
        })
        return points
    }

    get(id) {
        return this.plateMap.get(id)
    }

    getPlates() {
        return Array.from(this.plateMap.values())
    }

    getLandform(regionId) {
        return this.landformMap.get(regionId)
    }

    getBoundary(regionId) {
        return this.boundaryMap.get(regionId)
    }

    getLandformByPoint(point) {
        const region = this.regionGroup.getRegion(point)
        return this.landformMap.get(region.id)
    }

    get size() {
        return this.plateMap.size
    }
}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroup = data.regionGroup
        this.landformMap = data.landformMap
        this.boundaryMap = data.boundaryMap
        this.heightIndex = data.heightIndex
        this.boundary = data.boundary

        this.chance = data.boundary.chance
        this.growth = data.boundary.growth
    }

    isEmpty(neighborRegion) {
        return !this.landformMap.has(neighborRegion.id)
    }

    setValue(region, level) {
        const landform = this.boundary.getLandform(level)
        this.boundaryMap.set(region.id, this.boundary)
        this.landformMap.set(region.id, landform)
    }

    getNeighbors(region) {
        return this.regionGroup.getNeighborRegions(region)
    }
}


export class PlateMap {
    constructor(reGroupTileMap) {
        this.reGroupTileMap = reGroupTileMap
        this.map = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = this.reGroupTileMap.getGroups().sort(cmpDescendingCount)
        const typeMap = this._buildTypes(groups)
        groups.forEach(group => {
            const {id, origin, area} = group
            const neighborsGroups = this.reGroupTileMap.getNeighborGroups(group)
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
        const halfWorldArea = Math.floor(this.reGroupTileMap.area / 2)
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

    forEach(callback) {
        this.map.forEach(callback)
    }

    values() {
        return this.map.values()
    }
}


class Plate {
    constructor(id, origin, type, area, weight) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
        this.hasHotspot = Random.chance(HOTSPOT_CHANCE)
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
