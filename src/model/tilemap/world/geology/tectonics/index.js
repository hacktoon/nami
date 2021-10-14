import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Random } from '/lib/random'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { Landform } from '../landform'
import { BoundaryModel } from './boundary'
import { PlateMultiFill } from './fill'


const TYPE_CONTINENTAL = 'L'
const TYPE_OCEANIC = 'W'
const HOTSPOT_CHANCE = .4


export class TectonicsModel {
    constructor(realmTileMap, params) {
        this.realmTileMap = realmTileMap
        this.plateMap = new PlateMap(realmTileMap)
        this.landformMap = new Map()
        this.boundaryMap = new Map()
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this._buildLandforms()
        this._buildHotspots()
    }

    _buildLandforms() {
        const boundaryModel = new BoundaryModel(this.plateMap, this.realmTileMap)
        const borderRegionIds = this.realmTileMap.getBorderRegions()
        const fills = borderRegionIds.map(regionId => {
            const realmId = this.realmTileMap.getRealmByRegion(regionId)
            const boundary = this._buildBoundary(boundaryModel, realmId, regionId)
            const fillConfig = new RegionFillConfig({
                realmTileMap: this.realmTileMap,
                landformMap: this.landformMap,
                boundaryMap: this.boundaryMap,
                boundary,
            })
            return new OrganicFloodFill(regionId, fillConfig)
        })
        new MultiFill(fills)
    }

    _buildBoundary(boundaryModel, realmId, regionId) {
        const neighborRegionIds = this.realmTileMap.getNeighborRegions(regionId)
        for(let neighborId of neighborRegionIds) {
            const neighborRealmId = this.realmTileMap.getRealmByRegion(neighborId)
            if (neighborRealmId !== realmId) {
                return boundaryModel.get(realmId, neighborRealmId)
            }
        }
    }

    _buildHotspots() {
        this.plateMap.forEach(plate => {
            if (! plate.hasHotspot) return
            if (plate.isOceanic()) {
                const points = this._buildHotspotPoints(plate)
                for (let point of points) {
                    const regionId = this.realmTileMap.getRegion(point)
                    const current = this.landformMap.get(regionId)
                    if (current.water) {
                        const landform = Landform.getOceanicHotspot()
                        this.landformMap.set(regionId, landform)
                    }
                }
            } else {
                const regionId = this.realmTileMap.getRegion(plate.origin)
                const current = this.landformMap.get(regionId)
                if (! current.water) {
                    const landform = Landform.getContinentalHotspot()
                    this.landformMap.set(regionId, landform)
                }
            }
        })
    }

    _buildHotspotPoints(plate) {
        const count = Random.choice(2, 3)
        const size = this.realmTileMap.getAverageRegionArea()
        const offsets = []
        const xSig = Random.choice(-1, 1)
        const ySig = Random.choice(-1, 1)
        for (let i = 1; i <= count; i++) {
            const point = [size + i * xSig, size + i * ySig]
            offsets.push(point)
        }
        const points = [plate.origin]
        let current = plate.origin
        for(let point of offsets) {
            current = Point.plus(current, point)
            points.push(current)
        }
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
        const regionId = this.realmTileMap.getRegion(point)
        return this.landformMap.get(regionId)
    }

    get size() {
        return this.plateMap.size
    }
}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.realmTileMap = data.realmTileMap
        this.landformMap = data.landformMap
        this.boundaryMap = data.boundaryMap
        this.heightIndex = data.heightIndex
        this.boundary = data.boundary

        this.chance = data.boundary.chance
        this.growth = data.boundary.growth
    }

    isEmpty(neighborRegionId) {
        return !this.landformMap.has(neighborRegionId)
    }

    setValue(regionId, level) {
        const landform = this.boundary.getLandform(level)
        this.boundaryMap.set(regionId, this.boundary)
        this.landformMap.set(regionId, landform)
    }

    getNeighbors(regionId) {
        return this.realmTileMap.getNeighborRegions(regionId)
    }
}


export class PlateMap {
    constructor(realmTileMap) {
        this.map = new Map()
        this.realmTileMap = realmTileMap
        const realms = realmTileMap.getRealmsDescOrder()
        const typeMap = this._buildTypes(realms)
        realms.forEach(realmId => {
            const origin = realmTileMap.getRealmOriginById(realmId)
            const area = realmTileMap.getRealmAreaById(realmId)
            const neighborsRealms = realmTileMap.getNeighborRealms(realmId)
            const isLandlocked = neighborsRealms.concat(realmId)
                .every(neighborId => {
                    return typeMap.get(neighborId) === TYPE_CONTINENTAL
                })
            const type = isLandlocked ? TYPE_OCEANIC : typeMap.get(realmId)
            const baseWeight = (type === TYPE_OCEANIC ? realms.length * 10 : 0)
            const weight = realmId + baseWeight
            const plate = new Plate(realmId, origin, type, area, weight)
            this.map.set(plate.id, plate)
        })
    }

    _buildTypes(realms) {
        const halfWorldArea = Math.floor(this.realmTileMap.area / 2)
        const typeMap = new Map()
        let totalOceanicArea = 0
        realms.forEach(realmId => {
            totalOceanicArea += this.realmTileMap.getRealmAreaById(realmId)
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            typeMap.set(realmId, type)
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
    }

    isOceanic() {
        return this.type === TYPE_OCEANIC
    }

    isContinental() {
        return this.type === TYPE_CONTINENTAL
    }
}
