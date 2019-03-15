
class WorldBuilder {
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

        this._build()
    }

    _build() {
        new HeightMap(this.size, this.roughness, (point, height) => {
            let tile = this._buildTile(point, height)

            this._applyTerrainMask(tile)
            this._applyClimateMask(tile)

            this._measureTerrain(tile)
            this.world.setTile(point, tile)
        })
        this._process()
    }

    _buildTile(point, height) {
        let tile = new Tile(point)
        tile.terrain = new Terrain(height)
        tile.heat = new Heat(this.heatHeightmap.get(point))
        tile.rain = new Rain(this.rainHeightmap.get(point))
        return tile
    }

    _applyTerrainMask(tile) {
        let maskHeight = this.maskHeightmap.get(tile.point)
        if (maskHeight > this.size / 2) {
            tile.terrain.lower(1)
        }
    }

    _applyClimateMask(tile) {
        if (tile.terrain.isHighest)
            tile.heat.lower(2)
        if (tile.heat.isPolar)
            tile.rain.lower(3)
        if (tile.heat.isSubtropical)
            tile.rain.lower(1)
        if (tile.heat.isTropical)
            tile.rain.raise(2)
    }

    _measureTerrain(tile) {
        if (tile.terrain.isWater) {
            this.waterPoints.add(tile.point)
        } else {
            this.landPoints.add(tile.point)
            if (tile.terrain.isHighest) {
                this.highestPoints.add(tile.point)
            }
        }
    }

    _process() {
        // if (tile.terrain.isHighest()) {
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
        //     // measure terrain props

        // })
        //point = _.sample(currentWorld.geo.lowestPoints)
        //g = new GridFill(257, point, p=>{ worldPainter.drawPoint(p, "red") }, p=> { return currentWorld.getTile(p).terrain.isWater } )
    }

    _buildRivers() {

    }
}


class HeightFilter {
    static smooth(grid, tile) {
        let neighborhood = new PointNeighborhood(tile.point)
        let sum = tile.height
        let valueCount = 1
        neighborhood.adjacent(neighborTile => {
            sum += grid.get(neighborTile).height;
            valueCount++;
        });
        return Math.round(sum / valueCount);
    }
}
