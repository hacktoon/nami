
var World = (function(){
    var _World = function (size, roughness, totalPlates){
        var self = this;

        this.size = size;
        this.grid = Grid.new(size, size);
        this.area = Math.pow(size, 2);
        this.waterArea = 0;
        this.landArea = 0;

        this.terrainMap = TerrainMap.new();
        // this.tectonicsMap = TectonicsMap.new(this.size, totalPlates);
        // this.rainMap = RainMap.new(this.size, roughness/2);
        // this.heatMap = HeatMap.new(this.size);

        this.getTile = function(point) {
            return self.grid.get(point);
        };

        this.setTile = function(point, tile) {
            return self.grid.set(point, tile);
        };

        this.build = function() {
            var heightMap = HeightMap.new(size, roughness);
            // First pipeline step - create tiles through heightmap build
            heightMap.build(function(point, height){
                var tile = Tile.new(point);
                tile.height = height;
                self.setTile(point, tile);
            });

            // Second pipeline step - smoothing and feature detection
            self.grid.forEach(function(tile, point){
                //var neighbors = PointNeighborhood.new(point);
                var height = WorldFilter.smoothPoint(self.grid, tile.height, point);
                elevation = self.terrainMap.getNormalizedHeight(height);
                tile.elevation = elevation;
            });

            // height = self.terrainMap.getNormalizedHeight(height);
            // if (self.terrainMap.isWater(height)) {
            //     self.waterArea++;
            // } else {
            //     self.landArea++;
            // }
        };
    };

    return {
        new: function (size, roughness, totalPlates) {
            var world = new _World(size, roughness, totalPlates);
            world.build();
            //WorldFilter.apply(world);
            //world.tectonicsMap.buildPlates(); // change to setPoint - add to other maps
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
        neighborhood.around(function (neighborTile) {
            sum += grid.get(neighborTile).height;
            valueCount++;
        });
        return Math.round(sum / valueCount);
    };

    return {
        smoothPoint: smoothPoint
    };
})();


var Tile = (function(){
    var _Tile = function (point){
        var self = this;

        this.id = point.hash();
        this.point = point;
        this.height = 0;
        this.elevation = 0;
        this.plate = 0;
        this.biome = undefined;
    };

    return {
        new: function (point) {
            var tile = new _Tile(point);
            return tile;
        }
    };
})();