import _ from 'lodash'

import { Random } from '../lib/base'

import World from './world'
import WorldPainter from './painter'
import { ReliefMap } from './geo/relief'
import { WaterMap } from './geo/water'
import { HeatMap } from './atm/heat'
import { MoistureMap } from './atm/moisture'
import { BiomeMap } from './bio/biome'


export default class WorldBuilder {
    constructor(seed=+new Date(), size=257, roughness=8) {
        Random.seed = seed
        const reliefMap = new ReliefMap(size, roughness)
        this.world = new World(size)
        this.world.reliefMap = reliefMap
        this.painter = new WorldPainter(this.world)
        // this.world.waterMap = new WaterMap(size, reliefMap)
        // this.world.moistureMap = new MoistureMap(size, roughness)
        // this.world.heatMap = new HeatMap(size)
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
