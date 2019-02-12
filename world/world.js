

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
    var _World = function (roughness){
        var self = this,
            size = 257;

        this.terrainMap = TerrainMap.new(size, roughness);
        this.thermalMap = ThermalMap.new(size);
        this.moistureMap = MoistureMap.new(size, roughness/2);

        self.data = {
            water: 0,
            land: 0
        };
    };

    return {
        new: function(roughness) {
            var world = new _World(roughness);
            WorldFilter.apply(world);
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
        originalGrid.forEach(function(_, point) {
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
