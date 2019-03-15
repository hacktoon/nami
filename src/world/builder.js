
class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.waterPoints = new HashMap()
        this.landPoints = new HashMap()
        this.highestPoints = new HashMap()
        this._build(roughness)
    }

    _build(roughness) {
        let maskHeightmap = new HeightMap(this.world.size, roughness).grid
        let rainHeightmap = new HeightMap(this.world.size, roughness).grid
        let heatHeightmap = new HeatHeightMap(this.world.size).grid

        new HeightMap(this.world.size, roughness, (point, height) => {
            let maskHeight = maskHeightmap.get(point)
            let tile = new Tile(point)

            this.world.setTile(point, tile)
            tile.terrain = new Terrain(height)
            tile.rain = new Rain(rainHeightmap.get(point))
            tile.heat = new Heat(heatHeightmap.get(point))

            this._lowerTile(maskHeight, tile)
            this._measureTerrain(point, tile)
        })
        this._process()
    }

    _lowerTile(maskHeight, tile) {
        if (maskHeight > this.world.size / 2) {
            tile.terrain.lower(1)
        }
    }

    _measureTerrain(point, tile) {
        if (tile.terrain.isWater) {
            this.waterPoints.add(point)
        } else {
            this.landPoints.add(point)
            if (tile.terrain.isHighest()) {
                this.highestPoints.add(point)
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
