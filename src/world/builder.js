import _ from 'lodash'

import { HashMap, getChance } from '../lib/base'
import { HeightMap } from '../lib/heightmap'
import { PointNeighborhood } from '../lib/point'
import { ScanlineFill, Grid } from '../lib/grid'

import World from './world'
import Elevation from './elevation'
import Rain from './rain'
import Heat, {HeatHeightMap} from './heat'


export default class WorldBuilder {
    constructor(size, roughness) {
        this.size = size
        this.roughness = roughness
        this.world = new World(size)
        this.highestPoints = new HashMap()
        this.maskHeightmap = new HeightMap(size, roughness).grid
        this.rainHeightmap = new HeightMap(size, roughness).grid
        this.heatHeightmap = new HeatHeightMap(size).grid
    }

    build() {
        const _buildTile = (point, height) => {
            let tile = this.world.getTile(point)

            _setElevation(point, tile, height)
            _setClimate(point, tile)
        }

        const _setElevation = (point, tile, height) => {
            let maskElevation = new Elevation(this.maskHeightmap.get(point))

            tile.elevation = new Elevation(height)
            if (maskElevation.isAboveSeaLevel) {
                tile.elevation.lower()
            }
        }

        const _setClimate = (point, tile) => {
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

        new HeightMap(this.size, this.roughness, _buildTile)

        //this._process()

        return this.world
    }

    _process() {
        let waterBodyId = 1
        let waterBodiesGrid = new Grid(this.world.size, this.world.size, 0)

        const _buildWaterBody = point => {
            const onFill = point => waterBodiesGrid.set(point, waterBodyId)
            const isFillable = point => {
                let tile = this.world.getTile(point)
                return tile.elevation.isBelowSeaLevel && waterBodiesGrid.get(point) === 0
            }

            if (isFillable(point)) {
                new ScanlineFill(this.world.grid, point, onFill, isFillable).fill()
                waterBodyId++
            }
        }

        this.world.grid.forEach((tile, point) => {
            _buildWaterBody(point)
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
