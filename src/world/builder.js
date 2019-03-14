
class WorldBuilder {
    constructor(size, roughness) {
        this.world = new World(size)
        this.waterPoints = new HashMap()
        this.landPoints = new HashMap()
        this.highestPoints = new HashMap()
        this._buildTerrain(roughness)
        this._processTerrain()
    }

    _buildTerrain(roughness) {
        let maskGrid = new HeightMap(this.world.size, roughness).grid

        new HeightMap(this.world.size, roughness, (point, height) => {
            let maskHeight = maskGrid.get(point)
            let tile = new Tile(point)

            tile.terrain = new Terrain(height)
            if (maskHeight > this.world.size / 2) {
                tile.terrain.lower(1)
                //tile.heat.raise(1)
            }
            this._measureTerrain(tile, point)
            this.world.setTile(point, tile)
        })
    }

    _measureTerrain(tile, point) {
        if (tile.terrain.isWater) {
            this.waterPoints.add(point)
        } else {
            this.landPoints.add(point)
            if (tile.terrain.isHighest()) {
                this.highestPoints.add(point)
            }
        }
    }

    _processTerrain() {
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
