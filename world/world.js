
var World = (function(){
    var _World = function (size, roughness, totalPlates){
        var self = this;

        this.size = size;
        this.grid = Grid.new(size, size);
        this.area = Math.pow(size, 2);
        this.totalPlates = totalPlates;
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
            return Math.round(value);
        };

        this.build = function() {
            var heightMap = HeightMap.new(size, roughness);
            // First pipeline step - create tiles through heightmap build
            heightMap.build(function(point, height){
                var tile = Tile.new(point);
                tile.realHeight = height;
                self.setTile(point, tile);
            });

            // Second pipeline step - smoothing and area measure
            self.grid.forEach(function(tile, point){
                var realHeight = HeightFilter.smooth(self.grid, tile);
                tile.terrain = TerrainFilter.getTerrain(realHeight);
                LandformDetection.measureAreas(self, tile);
            });

            // Third pipeline step - plate tectonics. Reads all points
            PlateDeformation.deform(self, function (tile, point) {

            });

            return self;
        };
    };

    return {
        new: function (size, roughness, totalPlates) {
            var world = new _World(size, roughness, totalPlates);
            return world.build();
        }
    };
})();


var PlateDeformation = (function () {
    var deform = function (world, callback) {
        var tectonicsMap = TectonicsMap.new(world.size, world.totalPlates);
        tectonicsMap.build({ callback: callback });
    };

    return {
        deform: deform
    };
})();


var LandformDetection = (function () {
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
            sum = tile.realHeight,
            valueCount = 1;
        neighborhood.around(function (neighborTile) {
            sum += grid.get(neighborTile).realHeight;
            valueCount++;
        });
        return Math.round(sum / valueCount);
    };

    return {
        smooth: smooth
    };
})();


var TerrainFilter = (function () {
    var idMap = [
        { height: 0, color: "#000056", name: "Abyssal waters", isWater: true },
        { height: 60, color: "#1a3792", name: "Deep waters", isWater: true },
        { height: 110, color: "#489CFF", name: "Shallow waters", isWater: true },
        { height: 130, color: "#0a5816", name: "Coastal plains" },
        { height: 170, color: "#31771a", name: "Plains" },
        { height: 225, color: "#7ac85b", name: "Hills" },
        { height: 240, color: "#7d7553", name: "Mountains" },
        { height: 254, color: "#FFF", name: "Peaks" }
    ];

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
        getTerrain: getTerrain
    };
})();
