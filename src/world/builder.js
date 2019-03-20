import _ from 'lodash'

import { HeightMap } from '../lib/heightmap'

import World from './world'
import { HydrographyBuilder } from './geo/hydro'
import Elevation from './elevation'
import Heat, {HeatHeightMap} from './heat'
import Rain from './rain'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.size = size
        this.roughness = roughness
        this.world = new World(size)
        this.maskHeightmap = new HeightMap(size, roughness).grid
        this.rainHeightmap = new HeightMap(size, roughness).grid
        this.heatHeightmap = new HeatHeightMap(size).grid

        this.hydrographyBuilder = new HydrographyBuilder(this.world)
    }

    build() {
        const buildTile = (point, height) => {
            let tile = this.world.getTile(point)

            setElevation(point, tile, height)
            setClimate(point, tile)
        }

        const setElevation = (point, tile, height) => {
            let maskElevation = new Elevation(this.maskHeightmap.get(point))

            tile.elevation = new Elevation(height)
            if (maskElevation.isAboveSeaLevel) {
                tile.elevation.lower()
            }
        }

        const setClimate = (point, tile) => {
            tile.heat = new Heat(this.heatHeightmap.get(point))
            tile.rain = new Rain(this.rainHeightmap.get(point))

            if (tile.elevation.isHighest)
                tile.heat.lower(2)
            if (tile.heat.isPolar)
                tile.rain.lower(3)
            if (tile.heat.isSubtropical)
                tile.rain.lower(1)
            if (tile.heat.isTropical)
                tile.rain.raise(2)
        }

        new HeightMap(this.size, this.roughness, buildTile)
        //this._process()

        return this.world
    }

    _process() {
        this.world.grid.forEach((tile, point) => {
            //this.hydrographyBuilder.detectWaterBody(point)
        })

        return this.world
    }
}


// class HeightFilter {
//     static smooth(grid, tile) {
//         let neighborhood = new PointNeighborhood(point)
//         let sum = tile.height
//         let valueCount = 1
//         neighborhood.adjacent(neighborTile => {
//             sum += grid.get(neighborTile).height;
//             valueCount++;
//         });
//         return Math.round(sum / valueCount);
//     }
// }
