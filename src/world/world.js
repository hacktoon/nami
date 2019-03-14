
class World {
    constructor(size) {
        this.size = size
        this.area = Math.pow(size, 2)
        this.geo = new WorldGeo()
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


class WorldGeo {
    constructor () {
        this.lowestPoints = []
        this.highestPoints = []
    }
}


class WorldBuilder {
    static buildTerrain(world, roughness) {
        let maskGrid = new HeightMap(world.size, roughness).grid

        new HeightMap(world.size, roughness, (point, height) => {
            let maskHeight = maskGrid.get(point)
            let tile = new Tile(point)

            tile.terrain = new Terrain(height)
            if (maskHeight > world.size/2) {
                tile.terrain.lower(1)
            }

            if (tile.terrain.isLowest())
                world.geo.lowestPoints.push(point)
            if (tile.terrain.isHighest())
                world.geo.highestPoints.push(point)

            world.setTile(point, tile)
        })
    }

    static processTerrain(world, roughness) {
        //point = _.sample(currentWorld.geo.lowestPoints)
            //g = new GridFill(257, point, p=>{ worldPainter.drawPoint(p, "red") }, p=> { return currentWorld.getTile(p).terrain.isWater } )
    }

    static build(size, roughness) {
        let world = new World(size)

        WorldBuilder.buildTerrain(world, roughness)
        WorldBuilder.processTerrain(world, roughness)

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
