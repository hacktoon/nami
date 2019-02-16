
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

        this.waterPercentage = function () {
            var value = (self.waterArea * 100) / self.area
            return Math.round(value);
        };

        this.build = function() {
            var heightMap = HeightMap.new(size, roughness);
            // First pipeline step - create tiles through heightmap build
            heightMap.build(function(point, height){
                var tile = Tile.new(point);
                tile.height = height;
                self.setTile(point, tile);
            });

            // Second pipeline step - smoothing and area measure
            self.grid.forEach(function(tile, point){
                var height = HeightFilter.smooth(self.grid, tile);
                tile.terrain = self.terrainMap.getTerrainByHeight(height);
                LandformDetector.measureAreas(self, tile);
            });

            // Third pipeline step - smoothing and feature detection
            self.grid.forEach(function (tile, point) {

            });
        };
    };

    return {
        new: function (size, roughness, totalPlates) {
            var world = new _World(size, roughness, totalPlates);
            world.build();
            //HeightFilter.apply(world);
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


var LandformDetector = (function () {
    var measureAreas = function (world, tile) {
        if (tile.terrain.isWater) {
            world.waterArea++;
        } else {
            world.landArea++;
        }
    };

    return {
        measureAreas: measureAreas
    };
})();



var HeightFilter = (function(){
    var smooth = function (grid, tile) {
        var neighborhood = PointNeighborhood.new(tile.point),
            sum = tile.height,
            valueCount = 1;
        neighborhood.around(function (neighborTile) {
            sum += grid.get(neighborTile).height;
            valueCount++;
        });
        return Math.round(sum / valueCount);
    };

    return {
        smooth: smooth
    };
})();


var Tile = (function(){
    var _Tile = function (point){
        var self = this;

        this.id = point.hash();
        this.point = point;
        this.height = 0;
        this.plate = undefined;
        this.terrain = undefined;
        this.biome = undefined;
    };

    return {
        new: function (point) {
            var tile = new _Tile(point);
            return tile;
        }
    };
})();
