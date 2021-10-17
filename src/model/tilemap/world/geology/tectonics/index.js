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
        this.deformationMap = new Map()
        this.boundaryModel = new BoundaryModel(this.plateMap, this.realmTileMap)
        this.regionBoundaryMap = new Map()
        this.realmTileMap.getBorderRegions().forEach(regionId => {
            const boundary = this._buildBoundary(regionId)
            this.regionBoundaryMap.set(regionId, boundary)
        })
        this._buildLandforms()
        // this.mapFill = new PlateMultiFill(this)
        // this.mapFill.fill()
        this._buildHotspots()
    }

    _buildLandforms() {
        const fills = this.realmTileMap.getBorderRegions().map(regionId => {
            const fillConfig = new RegionFillConfig({
                realmTileMap: this.realmTileMap,
                landformMap: this.landformMap,
                deformationMap: this.deformationMap,
                regionBoundaryMap: this.regionBoundaryMap,
                regionId,
            })
            return new OrganicFloodFill(regionId, fillConfig)
        })
        new MultiFill(fills)
    }

    _buildBoundary(regionId) {
        const realmId = this.realmTileMap.getRealmByRegion(regionId)
        const neighborRegionIds = this.realmTileMap.getNeighborRegions(regionId)
        for(let neighborId of neighborRegionIds) {
            const neighborRealmId = this.realmTileMap.getRealmByRegion(neighborId)
            if (neighborRealmId !== realmId) {
                return this.boundaryModel.get(realmId, neighborRealmId)
            }
        }
    }

    _buildHotspots() {
        // TODO: this method shoud return a new landform array
        this.plateMap.forEach(plate => {
            if (! this.plateMap.hasHotspot(plate.id))
                return
            const plateOrigin = this.plateMap.getOrigin(plate.id)
            if (this.plateMap.isOceanic(plate.id)) {
                const points = this._buildHotspotPoints(plateOrigin)
                for (let point of points) {
                    const regionId = this.realmTileMap.getRegion(point)
                    const current = this.landformMap.get(regionId)
                    if (current.water) {
                        const landform = Landform.getOceanicHotspot()
                        // TODO: remove this set
                        this.landformMap.set(regionId, landform)
                    }
                }
            } else {
                const regionId = this.realmTileMap.getRegion(plateOrigin)
                const current = this.landformMap.get(regionId)
                if (! current.water) {
                    const landform = Landform.getContinentalHotspot()
                    // TODO: remove this set
                    this.landformMap.set(regionId, landform)
                }
            }
        })
    }

    _buildHotspotPoints(plateOrigin) {
        const count = Random.choice(2, 3)
        const size = this.realmTileMap.getAverageRegionArea()
        const offsets = []
        const [xSig, ySig] = [Random.choice(-1, 1), Random.choice(-1, 1)]
        for (let i = 1; i <= count; i++) {
            const point = [size + i * xSig, size + i * ySig]
            offsets.push(point)
        }
        const points = [plateOrigin]
        let current = plateOrigin
        for(let point of offsets) {
            current = Point.plus(current, point)
            points.push(current)
        }
        return points
    }

    getPlates() {
        return this.realmTileMap.getRealms()
    }

    getPlateDirection(realmId) {
        return this.plateMap.getDirection(realmId)
    }

    getLandform(regionId) {
        return this.landformMap.get(regionId)
    }

    getDeformation(regionId) {
        return this.deformationMap.get(regionId)
    }

    getLandformByPoint(point) {
        const regionId = this.realmTileMap.getRegion(point)
        return this.landformMap.get(regionId)
    }

    isOceanic(plateId) {
        return this.plateMap.isOceanic(plateId)
    }

    get size() {
        return this.plateMap.size
    }
}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.landformMap = data.landformMap
        this.realmTileMap = data.realmTileMap
        this.deformationMap = data.deformationMap
        this.regionBoundaryMap = data.regionBoundaryMap
        this.boundary = this.regionBoundaryMap.get(data.regionId)
        this.chance = this.boundary.chance
        this.growth = this.boundary.growth
    }

    isEmpty(neighborRegionId) {
        return !this.landformMap.has(neighborRegionId)
    }

    setValue(regionId, level) {
        const landform = this.boundary.getLandform(level)
        this.deformationMap.set(regionId, this.boundary)
        this.landformMap.set(regionId, landform)
    }

    getNeighbors(regionId) {
        return this.realmTileMap.getNeighborRegions(regionId)
    }
}
