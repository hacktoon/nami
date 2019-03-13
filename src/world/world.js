
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
            tile.terrain = Terrain.getTerrain(height)
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



var Terrain = (function () {
    var idMap = [
        { id: 0, height: 0, color: "#000056", name: "Abyssal waters", isWater: true },
        { id: 1, height: 80, color: "#1a3792", name: "Deep waters", isWater: true },
        { id: 2, height: 120, color: "#3379a6", name: "Shallow waters", isWater: true },
        { id: 3, height: 150, color: "#0a5816", name: "Coastal plains" },
        { id: 4, height: 190, color: "#31771a", name: "Plains" },
        { id: 5, height: 240, color: "#6f942b", name: "Hills" },
        { id: 6, height: 255, color: "#d5cab4", name: "Mountains" }
    ];

    var isDeepest = function (terrain) {
        return terrain.id === idMap[0].id;
    };

    var isHighest = function (terrain) {
        return terrain.id === getHighest()
    };

    var getHighest = function () {
        return _.last(idMap).id
    };

    var getTerrainById = function (id) {
        var id = _.clamp(id, 0, idMap.length-1);
        return idMap[id];
    };

    var getTerrain = function (height) {
        var terrain;
        _.each(idMap, function (candidade) {
            if (height >= candidade.height) {
                terrain = candidade;
            }
        });
        return terrain;
    };

    return {
        getTerrain: getTerrain,
        isDeepest: isDeepest,
        isHighest: isHighest,
        getHighest: getHighest,
        getTerrainById: getTerrainById
    };
})();
