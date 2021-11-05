import { Point } from '/lib/point'
import { Random } from '/lib/random'

import { Deformation } from './deformation'


export class HotspotModel {
    constructor(realmTileMap, plateModel) {
        this.realmTileMap = realmTileMap
        this.plateModel = plateModel

        this._regionDeformations = this._buildRegionDeformations()
    }

    _buildRegionDeformations() {
        const regions = new Map()
        // TODO: this method shoud return a new deformation array
        this.plateModel.forEach(plateId => {
            if (! this.plateModel.hasHotspot(plateId))
                return
            const plateOrigin = this.realmTileMap.getRealmOriginById(plateId)
            if (this.plateModel.isOceanic(plateId)) {
                const points = this._buildHotspotPoints(plateOrigin)
                for (let point of points) {
                    const regionId = this.realmTileMap.getRegion(point)
                    regions.set(regionId, 1) // OCEANIC HOTSPOT
                }
            } else {
                const regionId = this.realmTileMap.getRegion(plateOrigin)
                regions.set(regionId, 2) // CONTINENTAL HOTSPOT
            }
        })
        return regions
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
}