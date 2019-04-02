import _ from 'lodash'

import World from './world'
import { WaterbodyMap } from './geo/waterbody'
import Tile from './tile'
import { ReliefMap } from './geo/relief'
import { HeatMap } from './climate/heat'
import { MoistureMap } from './climate/moisture'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.reliefMap = new ReliefMap(size, roughness)
        this.heatMap = new HeatMap(size, .17)
        this.moistureMap = new MoistureMap(size, roughness)
        this.waterbodyMap = new WaterbodyMap(size, this.reliefMap, this.moistureMap)
        //this.riverMap = new RiverMap(this.world, this.waterbodyMap)
    }

    build() {
        const iterator = tile => {
            tile.relief = this.reliefMap.get(tile.point)
            tile.heat = this.heatMap.get(tile.point)
            tile.moisture = this.moistureMap.get(tile.point)
            tile.waterbody = this.waterbodyMap.get(tile.point)
            this._buildTileClimate(tile)
            this._determineTileType(tile)
        }

        this.world.iter(iterator)
        return this.world
    }

    _buildTileClimate(tile) {
        if (tile.heat.isPolar)
            tile.moisture.lower(3)
        if (tile.heat.isSubtropical)
            tile.moisture.lower(1)
        if (tile.heat.isTropical)
            tile.moisture.raise(2)
    }

    _determineTileType(tile) {
        let type = Tile.OCEAN
        if (tile.relief.isHighest) {
            tile.type = Tile.PEAK
            return
        }
        if (tile.relief.isMountain) {
            tile.type = Tile.MOUNTAIN
            return
        }
        if (tile.isWater) {
            if (tile.heat.isPolar) {
                type = Tile.ICECAP
            } else {
                if (tile.relief.isShallow) {
                    type = Tile.LITORAL
                }
            }
        } else {
            type = Tile.PLAIN
            if (tile.heat.isPolar) {
                type = Tile.ICECAP
            }
            if (tile.heat.isTemperate) {
                type = Tile.TAIGA
                if (tile.moisture.isHighest) {
                    type = Tile.BOREAL
                } else if (tile.moisture.isLowest) {
                    type = Tile.TUNDRA
                }
            }
            if (tile.heat.isSubtropical) {
                if (tile.moisture.isHighest) {
                    type = Tile.FOREST
                } else if (tile.moisture.isLowest) {
                    type = Tile.DESERT
                } else {
                    type = Tile.SAVANNA
                }
            }
            if (tile.heat.isTropical) {
                if (tile.moisture.isHighest) {
                    type = Tile.JUNGLE
                }
                if (tile.moisture.isLowest) {
                    type = Tile.SHRUBLAND
                }
            }
        }
        tile.type = type
    }
}
