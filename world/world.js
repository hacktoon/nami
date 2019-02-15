
var World = (function(){
    var _World = function (size, roughness, totalPlates){
        var self = this;

        this.size = size;
        this.area = Math.pow(this.size, 2);
        this.grid = Grid.new(this.size, this.size);

        this.terrainMap = TerrainMap.new(this.size, roughness);
        this.tectonicsMap = TectonicsMap.new(this.size, totalPlates);
        this.rainMap = RainMap.new(this.size, roughness/2);
        this.heatMap = HeatMap.new(this.size);
    };

    this.get = function(point) {
        return self.grid.get(point);
    };

    return {
        new: function (size, roughness, totalPlates) {
            var world = new _World(size, roughness, totalPlates);
            WorldFilter.apply(world);
            world.tectonicsMap.buildPlates(); // change to setPoint - add to other maps
            return world;
        }
        /**
         HeightMapCreation([terrainMap, rainMap], function(point, value){
              //map.setPoint(point, value) is called implicitly
              world.addTile()
         })
         .PlateDeformation(function(point, value){
              TerrainMap.setPoint(point, value)
         })
         */
    };
})();


var WorldFilter = (function(){
    var smoothPoint = function (grid, sum, point) {
        var neighborhood = PointNeighborhood.new(point),
            valueCount = 1;
        neighborhood.around(function (neighbor) {
            sum += grid.get(neighbor);
            valueCount++;
        });
        return Math.round(sum / valueCount);
    };

    var apply = function (world) {
        var originalGrid = world.terrainMap.heightMap.grid,
            newGrid = Grid.new(world.size, world.size);
        originalGrid.forEach(function (value, point) {
            var height = smoothPoint(originalGrid, value, point);
            height = world.terrainMap.getNormalizedHeight(height);
            newGrid.set(point, height);
        });
        world.terrainMap.heightMap.grid = newGrid;
    };

    return {
        apply: apply
    };
})();


var WorldTile = (function(){
    var _WorldTile = function (id, point, height, plate, biome){
        var self = this;

        this.id = id;
        this.point = point;
        this.height = height;
        this.plate = plate;
        this.biome = biome;
    };

    return {
        new: function (id, point, height, plate, biome) {
            var tile = new _WorldTile(id, point, height, plate, biome);
            return tile;
        }
    };
})();