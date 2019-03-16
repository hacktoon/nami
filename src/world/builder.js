import _ from 'lodash'

import {HashMap} from '../lib/base'
import {HeightMap} from '../lib/heightmap'

import World from './world'
import Elevation from './elevation'
import Rain from './rain'
import Heat, {HeatHeightMap} from './heat'
import { GridFill } from '../lib/grid';


export default class WorldBuilder {
    constructor(size, roughness) {
        this.size = size
        this.roughness = roughness
        this.world = new World(size)
        this.waterPoints = new HashMap()
        this.landPoints = new HashMap()
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
            if (maskElevation.isLand) {
                tile.elevation.lower(1)
            }
            _measureElevation(point, tile)
        }

        const _measureElevation = (point, tile) => {
            if (tile.elevation.isWater) {
                this.waterPoints.add(point)
            } else {
                this.landPoints.add(point)
                if (tile.elevation.isHighest) {
                    this.highestPoints.add(point)
                }
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

        this._process()

        return this.world
    }

    _process() {

        // if (tile.elevation.isHighest()) {
        //     if (maskHeight < 5 && _.sample([true, false])) {
        //         this.world.geo.riverSourcePoints.add(point)
        //     } else if (maskHeight > 125 && _.sample([true, false])) {
        //         this.world.geo.volcanoPoints.add(point)
        //     }
        // }

        //this._buildRivers()

        // this.world.geo.totalWaterPoints = this.waterPoints.length
        // this.world.geo.totalLandPoints = this.landPoints.length

        // })

        const _buildWaterBodies = () => {
            // while(this.waterPoints.size()) {
            //     let point = this.waterPoints
            //     _buildWaterBody(point)
            // }
        }

        const _buildWaterBody = startPoint => {
            // const onFill = point => {
            //     this.waterPoints.pop()
            // }
            // const isFillable = point => {
            //     let tile = this.world.getTile(point)
            //     return tile.elevation.isWater
            // }
            // new GridFill(startPoint, onFill, isFillable).fill()
        }

        _buildWaterBodies()

        // this.world.grid.forEach((tile, point) => {

        // })

        return this.world
    }

    _buildRivers() {

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
