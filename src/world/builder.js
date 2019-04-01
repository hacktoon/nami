import _ from 'lodash'

import World from './world'
import { WaterbodyMap } from './geo/waterbody'
import { RiverMap } from './geo/river'
import { ReliefMap } from './geo/relief'
import { HeatMap } from './climate/heat'
import { MoistureMap } from './climate/moisture'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.reliefMap = new ReliefMap(size, roughness)
        this.moistureMap = new MoistureMap(size, roughness)
        this.heatMap = new HeatMap(size, .17)
        this.waterbodyMap = new WaterbodyMap(size, this.reliefMap, this.moistureMap)
        //this.riverMap = new RiverMap(this.world, this.waterbodyMap)
    }

    build() {
        this.world.iter(tile => {
            tile.relief = this.reliefMap.get(tile.point)
            tile.moisture = this.moistureMap.get(tile.point)
            tile.heat = this.heatMap.get(tile.point)
            this._buildTileClimate(tile)
        })

        // apply deformations
        this.world.iter(tile => {
            let point = tile.point
            let waterbody = this.waterbodyMap.get(point)
            if (waterbody){
                tile.waterbody = waterbody
            }

        })

        return this.world
    }

    _buildTileClimate(tile) {
        if (tile.relief.isHighest)
            tile.heat.lower(2)
        if (tile.heat.isPolar)
            tile.moisture.lower(3)
        if (tile.heat.isSubtropical)
            tile.moisture.lower(1)
        if (tile.heat.isTropical)
            tile.moisture.raise(2)
    }
}
