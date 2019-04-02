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
        //this.riverMap = new RiverMap(this.world, this.waterbodyMap)
    }

    build() {
        const iterator = tile => {
            tile.relief = this.reliefMap.get(tile.point)
            tile.heat = this.heatMap.get(tile.point)
            tile.moisture = this.moistureMap.get(tile.point)
            tile.waterbody = this.waterbodyMap.get(tile.point)
            this._buildTileClimate(tile)
            tile.type = this._determineTileType(tile)
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
        if (tile.relief.isHighest)
            return Tile.PEAK

        if (tile.relief.isMountain)
            return Tile.MOUNTAIN

        if (tile.isWater) {
            if (tile.heat.isPolar) {
                if (tile.relief.isShallow || tile.relief.isLowest) {
                    return Tile.ICECAP
                }
            } else if (tile.relief.isShallow) {
                return Tile.LITORAL
            }
            return Tile.OCEAN
        } else {
            if (tile.heat.isPolar) {
                return Tile.TUNDRA
            }
            if (tile.heat.isTemperate) {
                if (tile.relief.isHighland && tile.moisture.isLowest) {
                    return Tile.TUNDRA
                }
                if (tile.moisture.isHighest || tile.moisture.isWet) {
                    return Tile.TAIGA
                }
                return Tile.STEPPE
            }
            if (tile.heat.isSubtropical) {
                if (tile.moisture.isHighest || tile.relief.isBasin) {
                    return Tile.FOREST
                }
                if (tile.moisture.isLowest) {
                    return Tile.DESERT
                }
                if (tile.moisture.isWet) {
                    return Tile.SAVANNA
                }
                if (tile.moisture.isDry) {
                    return Tile.SHRUBLAND
                }
            }
            if (tile.heat.isTropical) {
                if (tile.moisture.isHighest) {
                    if (tile.relief.isBasin || tile.relief.isPlatform) {
                        return Tile.JUNGLE
                    } else {
                        return Tile.FOREST
                    }
                } else if (tile.moisture.isDry) {
                    return Tile.PLAIN
                } else if (tile.relief.isHighland) {
                    return Tile.SAVANNA
                }
            }
            return Tile.PLAIN
        }
    }
}
