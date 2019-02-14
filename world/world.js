

// var WorldBuilder = (function () {})();

// var WorldStatistics = (function () {})();

var Terrain = (function () {

    return {
        new: function () {
            var world = new _World();
            WorldFilter.apply(world);
            return world;
        }
    };
})();


var World = (function(){
    var _World = function (roughness, plates){
        var self = this,
            size = 257;

        this.terrainMap = TerrainMap.new(size, roughness);
        this.tectonicsMap = TectonicsMap.new(size, plates);
        this.heatMap = HeatMap.new(size);
        this.rainMap = RainMap.new(size, roughness/2);

        self.data = {
            water: 0,
            land: 0
        };
    };

    return {
        new: function (roughness, plates) {
            var world = new _World(roughness, plates);
            WorldFilter.apply(world);
            world.tectonicsMap.buildPlates();
            return world;
        }
    };
})();



var WorldFilter = (function(){
    var normalizeHeight = function (world, rawHeight) {
        var height = 1;
        _.each(world.terrainMap.idMap, function(terrain, code){
            if (rawHeight >= terrain.height) {
                height = code;
            }
        });
        return height;
    };

    var smooth = function (grid, point) {
        var neighborhood = PointNeighborhood.new(point),
            neighborCount = 0,
            sum = 0;
        neighborhood.around(function (neighbor) {
            sum += grid.get(neighbor);
            neighborCount++;
        });
        return Math.round(sum / neighborCount);
    };

    var apply = function (world) {
        var originalGrid = world.terrainMap.grid,
            heightMap = _.cloneDeep(originalGrid),
            height = 0;
        originalGrid.forEach(function (value, point) {
            height = smooth(originalGrid, point);
            height = normalizeHeight(world, height);
            heightMap.set(point, height);
        });
        world.terrainMap.grid = heightMap;
    };

    return {
        apply: apply
    };

})();
