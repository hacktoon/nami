import _ from 'lodash'

import {HashMap} from '../lib/base'
import {HeightMap} from '../lib/heightmap'

import World from './world'
import Elevation from './elevation'
import Rain from './rain'
import Heat, {HeatHeightMap} from './heat'
import Tile from '../lib/tile'


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
        const _buildTerrain = (point, height) => {
            let tile = this.world.getTile(point)

            tile.elevation = new Elevation(height)
            tile.heat = new Heat(this.heatHeightmap.get(point))
            tile.rain = new Rain(this.rainHeightmap.get(point))

            _applyElevationMask(point, tile)
            _applyClimateMask(point, tile)
            _measureElevation(point, tile)
        }

        const _applyElevationMask = (point, tile) => {
            let maskHeight = this.maskHeightmap.get(point)
            if (maskHeight > this.size / 2) {
                tile.elevation.lower(1)
            }
        }

        const _applyClimateMask = (point, tile) => {
            if (tile.elevation.isHighest)
                tile.heat.lower(2)
            if (tile.heat.isPolar)
                tile.rain.lower(3)
            if (tile.heat.isSubtropical)
                tile.rain.lower(1)
            if (tile.heat.isTropical)
                tile.rain.raise(2)
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

        new HeightMap(this.size, this.roughness, _buildTerrain)

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

        this._buildRivers()

        this.world.geo.totalWaterPoints = this.waterPoints.size()
        this.world.geo.totalLandPoints = this.landPoints.size()

        // this.world.grid.forEach((tile, point) => {
        //     // measure elevation props

        // })
        //point = _.sample(currentWorld.geo.lowestPoints)
        //g = new GridFill(257, point, p=>{ worldPainter.drawPoint(p, "red") }, p=> { return currentWorld.getTile(p).elevation.isWater } )
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
