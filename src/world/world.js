
var World = function (size){
    var self = this;

    // stable attributes
    this.size = size;
    this.area = Math.pow(size, 2);
    this.geo = {};
    this.bio = {};
    this.climate = {};

    this.grid = new Grid(size, size);

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

    this.raiseTerrain = function (point, value) {
        var tile = self.grid.get(point);
        var value = tile.height + value;
        tile.height = value;
    };

    this.lowerTerrain = function (point, value) {
        var tile = self.grid.get(point);
        var value = tile.height - value;
        tile.height = value < 0 ? 0 : value;
    };
};


var WorldBuilder = (function(){
    function buildHeightmap(world, roughness) {
        var heightMap = new HeightMap(world.size, roughness, (point, height) => {
            var tile = new Tile(point);
            tile.height = height;
            world.setTile(point, tile);
        })
    };

    function smooth(world) {
        world.grid.forEach(function(tile){
            var height = HeightFilter.smooth(world.grid, tile);
            tile.terrain = Terrain.getTerrain(height);
        });
    };

    function build(size, roughness, numPlates) {
        var world = new World(size);

        buildHeightmap(world, roughness);
        TectonicsBuilder(world, numPlates);
        // detect waterbodies, landforms, create oceans
        smooth(world); // measure land/area

        return world;
    };

    return { build: build }
})();


var HeightFilter = (function(){
    var smooth = function (grid, tile) {
        var neighborhood = new PointNeighborhood(tile.point),
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
        { id: 4, height: 190, color: "#31771a", name: "Plains" },
        { id: 5, height: 240, color: "#6f942b", name: "Hills" },
        { id: 6, height: 255, color: "#d5cab4", name: "Mountains" }
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