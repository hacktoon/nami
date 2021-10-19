import { Point } from '/lib/point'
import { Random } from '/lib/random'

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
        this.origins = this.realmTileMap.getBorderRegions()
        this.mapFill = this._buildMapFill()
        this._buildHotspots()
    }

    _buildMapFill() {
        for(let id = 0; id < this.origins.length; id ++) {
            const regionId = this.origins[id]
            const boundary = this._buildBoundary(regionId)
            this.regionBoundaryMap.set(id, boundary)
        }
        this.mapFill = new PlateMultiFill(this); this.mapFill.fill(true)
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

    getBoundary(regionId) {
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
