import _ from 'lodash'

import World from './world'
import { WaterbodyMap } from './geo/waterbody'
import { BiomeMap } from './bio/biome'
import { ReliefMap } from './geo/relief'
import { HeatMap } from './climate/heat'
import { MoistureMap } from './climate/moisture'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.reliefMap = new ReliefMap(size, roughness)
        this.heatMap = new HeatMap(size, .2)
        this.moistureMap = new MoistureMap(size, roughness)
        this.waterbodyMap = new WaterbodyMap(size, this.reliefMap, this.moistureMap)
        this.biomeMap = new BiomeMap(
            this.reliefMap,
            this.heatMap,
            this.moistureMap,
            this.waterbodyMap
        )
    }

    build() {
        window.currentWorld = this.world
        this.world.iter(tile => {
            tile.relief = this.reliefMap.get(tile.point)
            tile.heat = this.heatMap.get(tile.point)
            tile.moisture = this.moistureMap.get(tile.point)
            tile.waterbody = this.waterbodyMap.get(tile.point)
            tile.type = this.biomeMap.get(tile.point)
        })
        return this.world
    }


}
