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
        this.heatMap = new HeatMap(size, .2)
        this.moistureMap = new MoistureMap(size, roughness)
        this.waterbodyMap = new WaterbodyMap(size, this.reliefMap, this.moistureMap)
    }

    build() {
        window.currentWorld = this.world
        const iterator = tile => {
            tile.relief = this.reliefMap.get(tile.point)
            tile.heat = this.heatMap.get(tile.point)
            tile.moisture = this.moistureMap.get(tile.point)
            tile.waterbody = this.waterbodyMap.get(tile.point)
            tile.type = this._determineTileType(tile)
        }

        this.world.iter(iterator)
        return this.world
    }

    _determineTileType(tile) {
        this._filterTileClimate(tile)
        if (tile.isWater) {
            if (tile.heat.isPolar) {
                if (tile.relief.isShallow || tile.relief.isTrench) {
                    return Tile.ICECAP
                }
            }
            if (tile.relief.isShallow) {
                return Tile.LITORAL
            }
            return Tile.OCEAN
        }
        if (tile.heat.isPolar) {
            return Tile.TUNDRA
        }
        if (tile.heat.isTemperate) {
            if (tile.moisture.isHighest || tile.moisture.isWet) {
                return Tile.TAIGA
            }
            return Tile.STEPPE
        }
        if (tile.heat.isSubtropical) {
            if (tile.moisture.isWet) {
                return Tile.SAVANNA
            }
            if (tile.moisture.isDry) {
                return Tile.SHRUBLAND
            }
            if (tile.moisture.isLowest) {
                return Tile.DESERT
            }
            return Tile.FOREST
        }
        if (tile.heat.isTropical) {
            if (tile.moisture.isHighest) {
                if (tile.relief.isBasin || tile.relief.isPlatform) {
                    return Tile.JUNGLE
                }
            }
            if (tile.relief.isPlatform){
                return Tile.FOREST
            }
            return Tile.PLAIN
        }
    }

    _filterTileClimate(tile) {
        if (tile.heat.isPolar)
            tile.moisture.lower(3)
        if (tile.heat.isSubtropical)
            tile.moisture.lower(1)
        if (tile.heat.isTropical)
            tile.moisture.raise(2)
    }
}
