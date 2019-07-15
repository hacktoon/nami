import _ from 'lodash'

import World from './world'
import { WaterbodyMap } from './geo/waterbody'
import { LandmassMap } from './geo/landmass'
import { BiomeMap } from './bio/biome'
import { ReliefMap } from './geo/relief'
import { HeatMap } from './climate/heat'
import { MoistureMap } from './climate/moisture'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.reliefMap = new ReliefMap(size, roughness)
        this.heatMap = new HeatMap(size, this.reliefMap)
        this.moistureMap = new MoistureMap(size, roughness, this.reliefMap)
        this.waterbodyMap = new WaterbodyMap(size, this.reliefMap, this.moistureMap)
        this.landmassMap = new LandmassMap(size, this.reliefMap, this.waterbodyMap)
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
            const point = tile.point
            tile.relief = this.reliefMap.get(point)
            tile.heat = this.heatMap.get(point)
            tile.moisture = this.moistureMap.get(point)
            tile.waterbody = this.waterbodyMap.get(point)
            tile.landmass = this.landmassMap.get(point)
            tile.isLitoral = this.landmassMap.isLitoral(point)
            tile.biome = this.biomeMap.get(point)
        })
        return this.world
    }


}
