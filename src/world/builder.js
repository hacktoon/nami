import _ from 'lodash'

import World from './world'
import { ReliefMap } from './geo/relief'
import { WaterMap } from './geo/water'
import { HeatMap } from './atm/heat'
import { MoistureMap } from './atm/moisture'
import { BiomeMap } from './bio/biome'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        const reliefMap = new ReliefMap(size, roughness)
        const heatMap = new HeatMap(size)
        const moistureMap = new MoistureMap(size, roughness)
        const waterMap = new WaterMap(size, reliefMap)

        // const landmassMap = new LandmassMap(this.reliefMap, this.waterMap)
        // this.biomeMap = new BiomeMap(
        //     this.reliefMap,
        //     this.heatMap,
        //     this.moistureMap,
        //     this.waterMap
        // )
        this.world.reliefMap = reliefMap
        this.world.heatMap = heatMap
        this.world.moistureMap = moistureMap
        this.world.waterMap = waterMap
    }

    build() {
        window.world = this.world
        //this.world.iter(tile => this.updateTile(tile))
        return this.world
    }

    updateTile(tile) {
        const point = tile.point
        // tile.relief = this.reliefMap.get(point)
        // tile.heat = this.heatMap.get(point)
        // tile.moisture = this.moistureMap.get(point)
        // tile.water = this.waterMap.get(point)
        // tile.landmass = this.landmassMap.get(point)
        // tile.biome = this.biomeMap.get(point)
    }
}
