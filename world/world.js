
var World = function (size){
    var self = this;

    // stable attributes
    this.size = size;
    this.area = Math.pow(size, 2);
    this.geo = {};
    this.bio = {};
    this.climate = {};

    this.grid = Grid.new(size, size);

    this.waterArea = 0;
    this.landArea = 0;

    // this.rainMap = RainMap.new(this.size, roughness/2);
    // this.heatMap = HeatMap.new(this.size);

    this.getTile = function(point) {
        return self.grid.get(point);
    };

    this.setTile = function(point, tile) {
        return self.grid.set(point, tile);
    };

    this.waterPercentage = function () {
        var value = (self.waterArea * 100) / self.area;
        return value.toFixed(1);
    };

    this.updateAreaMeasure = function (oldTerrain, newTerrain) {
        if (oldTerrain.isWater === newTerrain.isWater) return;
        self.waterArea += newTerrain.isWater ?  1 : -1;
        self.landArea  += newTerrain.isWater ? -1 :  1;
    };

    this.raiseTerrain = function (point) {
        var tile = self.getTile(point),
            oldTerrain = tile.terrain;
        tile.terrain = Terrain.getTerrainbyId(oldTerrain.id + 1);
        self.updateAreaMeasure(oldTerrain, tile.terrain);
    };

    this.lowerTerrain = function (point) {
        var tile = self.getTile(point),
            oldTerrain = tile.terrain;
        tile.terrain = Terrain.getTerrainbyId(oldTerrain.id - 1);
        self.updateAreaMeasure(oldTerrain, tile.terrain);
    };
};


var WorldBuilder = (function(){
    function buildHeightmap(world, roughness) {
        var heightMap = HeightMap.new(world.size, roughness)
        heightMap.build(function(point, height){
            var tile = Tile.new(point);
            tile.height = height;
            tile.terrain = Terrain.getTerrain(height);
            LandformDetection.measureAreas(world, tile);
            world.setTile(point, tile);
        });
    };

    function build(size, roughness, numPlates) {
        var world = new World(size);
        var deepestPoints = new PointMap();

        buildHeightmap(world, roughness);

        // Second step - area measure
        world.grid.forEach(function(tile){
            if (Terrain.isDeepest(tile.terrain)) {
                deepestPoints.add(tile.point);
            }
        });
        LandformDetection.detectWaterBodies(world, deepestPoints);

        // Third step - plate tectonics. Reads all points
        TectonicsBuilder(world, numPlates);

        return world;
    };

    return { build: build }
})();


var LandformDetection = (function () {
    var measureAreas = function (world, tile) {
        if (tile.terrain.isWater) {
            world.waterArea++;
        } else {
            world.landArea++;
        }
    };

    var detectWaterBodies = function (world, deepestPoints) {
        var body = detectWaterBody(_.sample(deepestPoints));

    };

    var detectWaterBody = function (point, deepestPoints) {


    };

    return {
        measureAreas: measureAreas,
        detectWaterBodies: detectWaterBodies
    };
})();


var HeightFilter = (function(){
    var smooth = function (grid, tile) {
        var neighborhood = PointNeighborhood.new(tile.point),
            sum = tile.height,
            valueCount = 1;
        neighborhood.adjacent(function (neighborTile) {
            sum += grid.get(neighborTile).height;
            valueCount++;
        });
        return Math.round(sum / valueCount);
    };

    return {
        smooth: smooth
    };
})();


var Terrain = (function () {
    var idMap = [
        { id: 0, height: 0, color: "#000056", name: "Abyssal waters", isWater: true },
        { id: 1, height: 80, color: "#1a3792", name: "Deep waters", isWater: true },
        { id: 2, height: 120, color: "#3379a6", name: "Shallow waters", isWater: true },
        { id: 3, height: 150, color: "#0a5816", name: "Coastal plains" },
        { id: 4, height: 200, color: "#31771a", name: "Plains" },
        { id: 5, height: 240, color: "#7ac85b", name: "Hills" },
        { id: 6, height: 250, color: "#7d7553", name: "Mountains" },
        { id: 7, height: 257, color: "#EEE", name: "Peaks" }
    ];

    var isDeepest = function (terrain) {
        return terrain.id === idMap[0].id;
    };

    var getTerrainbyId = function (id) {
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
        getTerrainbyId: getTerrainbyId
    };
})();
