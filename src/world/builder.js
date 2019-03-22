import _ from 'lodash'

import { HeightMap } from '../lib/heightmap'

import World from './world'
import { WaterBodyMap } from './geo/waterbody'
import { ElevationMap } from './geo/elevation'
import { HeatMap } from './climate/heat'
import { RainMap } from './climate/rain'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)

        this.elevationMap = new ElevationMap(size, roughness)
        this.rainMap = new RainMap(size, roughness)
        this.heatMap = new HeatMap(size, .17)

        //this.waterBodyMap = new WaterBodyMap(this.world)
    }

    build() {
        const setClimate = (point, tile) => {
            if (tile.elevation.isHighest)
                tile.heat.lower(2)
            if (tile.heat.isPolar)
                tile.rain.lower(3)
            if (tile.heat.isSubtropical)
                tile.rain.lower(1)
            if (tile.heat.isTropical)
                tile.rain.raise(2)
        }

        this.world.forEach((tile, point) => {
            tile.elevation = this.elevationMap.get(point)
            tile.rain = this.rainMap.get(point)
            tile.heat = this.heatMap.get(point)

            //setClimate(point, tile)
        })

        //this._process()

        return this.world
    }

    _process() {
        this.world.grid.forEach((tile, point) => {
            this.waterBodyMap.detectWaterBody(point)
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
