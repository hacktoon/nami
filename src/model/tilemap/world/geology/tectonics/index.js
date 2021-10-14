import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Random } from '/lib/random'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { Landform } from '../landform'
import { BoundaryModel } from './boundary'
import { PlateMultiFill } from './fill'
import { PlateMap } from './plate'


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
        // this.mapFill = new PlateMultiFill(this)
    }

    _buildLandforms() {
        const boundaryModel = new BoundaryModel(this.plateMap, this.realmTileMap)
        const borderRegionIds = this.realmTileMap.getBorderRegions()
        // create boundaryMap here and pass to fill
        // const boundaryMap = this._buildBoundary(boundaryModel, realmId, regionId)
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

    isOceanic(plateId) {
        return this.plateMap.isOceanic(plateId)
    }

    isContinental(plateId) {
        return this.plateMap.isContinental(plateId)
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
