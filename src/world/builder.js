import _ from 'lodash'

import World from './world'
import { WaterBodyMap } from './geo/waterbody'
import { ElevationMap } from './geo/elevation'
import { HeatMap } from './climate/heat'
import { MoistureMap } from './climate/moisture'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.elevationMap = new ElevationMap(size, roughness)
        this.moistureMap = new MoistureMap(size, roughness)
        this.heatMap = new HeatMap(size, .17)
        this.waterBodyMap = new WaterBodyMap(this.world)
    }

    build() {
        const filterClimate = (tile) => {
            if (tile.elevation.isHighest)
                tile.heat.lower(2)
            if (tile.heat.isPolar)
                tile.moisture.lower(3)
            if (tile.heat.isSubtropical)
                tile.moisture.lower(1)
            if (tile.heat.isTropical)
                tile.moisture.raise(2)
        }

        this.world.forEach((tile, point) => {
            tile.elevation = this.elevationMap.get(point)
            tile.moisture = this.moistureMap.get(point)
            tile.heat = this.heatMap.get(point)
            filterClimate(tile)
        })

        this._detectSurface()
        return this.world
    }

    _detectSurface() {
        this.world.forEach((tile, point) => {
            this.waterBodyMap.detectWaterBody(point)
        })
    }
}
