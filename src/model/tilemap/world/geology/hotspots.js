import { Point } from '/lib/point'
import { Random } from '/lib/random'

import { Landform } from './landform'


export class HotspotModel {
    constructor(realmTileMap, plateModel, tectonicsModel) {
        this.realmTileMap = realmTileMap
        this.plateModel = plateModel
        this.tectonicsModel = tectonicsModel

        this._build()
    }

    _build() {
        // TODO: this method shoud return a new landform array
        this.plateModel.forEach(plateId => {
            if (! this.plateModel.hasHotspot(plateId))
                return
            const plateOrigin = this.realmTileMap.getRealmOriginById(plateId)
            if (this.plateModel.isOceanic(plateId)) {
                const points = this._buildHotspotPoints(plateOrigin)
                for (let point of points) {
                    const regionId = this.realmTileMap.getRegion(point)
                    const current = this.tectonicsModel.getLandform(regionId)
                    if (current.water) {
                        const landform = Landform.getOceanicHotspot()
                        // TODO: remove this set
                        this.tectonicsModel.setLandform(regionId, landform)
                    }
                }
            } else {
                const regionId = this.realmTileMap.getRegion(plateOrigin)
                const current = this.tectonicsModel.getLandform(regionId)
                if (! current.water) {
                    const landform = Landform.getContinentalHotspot()
                    // TODO: remove this set
                    this.tectonicsModel.setLandform(regionId, landform)
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
}