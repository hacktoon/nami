import _ from 'lodash'

import World from './world'
import { WaterBodyMap } from './geo/waterbody'
import { ElevationMap } from './geo/elevation'
import { HeatMap } from './climate/heat'
import { MoistureMap } from './climate/moisture'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        window.currentWorld = this.world

        this.elevationMap = new ElevationMap(size, roughness)
        this.moistureMap = new MoistureMap(size, roughness)
        this.heatMap = new HeatMap(size, roughness=.17)
    }

    build() {
        this.world.forEach((tile, point) => {
            tile.elevation = this.elevationMap.get(point)
            tile.moisture = this.moistureMap.get(point)
            tile.heat = this.heatMap.get(point)
            this.filterClimate(tile)
        })

        this._process()
        return this.world
    }

    filterClimate(tile) {
        if (tile.elevation.isHighest)
            tile.heat.lower(2)
        if (tile.heat.isPolar)
            tile.moisture.lower(3)
        if (tile.heat.isSubtropical)
            tile.moisture.lower(1)
        if (tile.heat.isTropical)
            tile.moisture.raise(2)
    }

    _process() {
        this.waterBodyMap = new WaterBodyMap(this.world)

    }
}
