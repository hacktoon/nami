
class World {
    constructor(size) {
        this.size = size
        this.area = Math.pow(size, 2)
        this.geo = {}
        this.bio = {}
        this.climate = {}

        this.grid = new Grid(size, size)

        this.waterArea = 0
        this.landArea = 0

        // this.rainMap = new RainMap(this.size, roughness/2)
        // this.heatMap = new HeatMap(this.size)
    }

    getTile (point) {
        return this.grid.get(point)
    }

    setTile (point, tile) {
        return this.grid.set(point, tile)
    }

    waterPercentage () {
        let value = (this.waterArea * 100) / this.area
        return value.toFixed(1)
    }

    updateAreaMeasure (oldTerrain, newTerrain) {
        if (oldTerrain.isWater === newTerrain.isWater) return
        this.waterArea += newTerrain.isWater ?  1 : -1
        this.landArea  += newTerrain.isWater ? -1 :  1
    }

    // raiseTerrain (startPoint) {
    //     let terrain = this.grid.get(startPoint).terrain
    //     let currentlevel = terrain.id
    //     let growthRates = [8, 4, 2]

    //     if(! Terrain.isHighest(terrain)) {
    //         currentlevel++
    //     }
    //     _.times(growthRates.length, count => {
    //         new GridFill(startPoint, (point) => {
    //             let tile = this.grid.get(point)
    //             if (tile.terrain.id + 1 == currentlevel)
    //                 tile.terrain = Terrain.getTerrainById(currentlevel)
    //         }).growPartial(growthRates[count])
    //         currentlevel--
    //     })
    // }
}


class WorldBuilder {
    static buildHeightmap(world, roughness) {
        new HeightMap(world.size, roughness, (point, height) => {
            let tile = new Tile(point)
            tile.height = height
            world.setTile(point, tile)
        })
    }

    static smooth(world) {
        world.grid.forEach(tile => {
            let height = HeightFilter.smooth(world.grid, tile)
            tile.terrain = new Terrain(height)
        })
    }

    static build(size, roughness) {
        let world = new World(size)

        WorldBuilder.buildHeightmap(world, roughness)
        WorldBuilder.smooth(world) // measure land/area
        // detect waterbodies, landforms, create oceans

        return world
    }
}


class HeightFilter {
    static smooth (grid, tile) {
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

