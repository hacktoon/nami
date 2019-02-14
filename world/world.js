
var World = (function(){
    var _World = function (roughness, plates){
        var self = this,
            size = 257;

        this.terrainMap = TerrainMap.new(size, roughness);
        this.tectonicsMap = TectonicsMap.new(size, plates);
        this.heatMap = HeatMap.new(size);
        this.rainMap = RainMap.new(size, roughness/2);
    };

    return {
        new: function (roughness, plates) {
            var world = new _World(roughness, plates);
            WorldFilter.apply(world);
            world.tectonicsMap.buildPlates(world.terrainMap);
            return world;
        }
    };
})();


var WorldFilter = (function(){
    var smoothPoint = function (grid, point) {
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
            newGrid = _.cloneDeep(originalGrid),
            height = 0;
        originalGrid.forEach(function (value, point) {
            height = smoothPoint(originalGrid, point);
            height = world.terrainMap.getNormalizedHeight(height);
            newGrid.set(point, height);
        });
        world.terrainMap.grid = newGrid;
    };

    return {
        apply: apply
    };

})();
