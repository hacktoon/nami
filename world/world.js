
var World = (function(){
    var _World = function (size, roughness, numPlates){
        var self = this;

        this.size = size;
        this.grid = Grid.new(size, size);
        this.area = Math.pow(size, 2);
        this.numPlates = numPlates;
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
            tile.terrain = TerrainFilter.getTerrainbyId(oldTerrain.id + 1);
            self.updateAreaMeasure(oldTerrain, tile.terrain);
        };

        this.lowerTerrain = function (point) {
            var tile = self.getTile(point),
                oldTerrain = tile.terrain;
            tile.terrain = TerrainFilter.getTerrainbyId(oldTerrain.id - 1);
            self.updateAreaMeasure(oldTerrain, tile.terrain);
        };

        this.build = function() {
            var heightMap = HeightMap.new(size, roughness);
            // First pipeline step - create tiles through heightmap build
            heightMap.build(function(point, height){
                var tile = Tile.new(point);
                tile.height = height;
                self.setTile(point, tile);
            });

            // Second step - smoothing and area measure
            self.grid.forEach(function(tile){
                var height = HeightFilter.smooth(self.grid, tile);
                tile.terrain = TerrainFilter.getTerrain(height);
                LandformDetection.measureAreas(self, tile);
            });

            // Third step - plate tectonics. Reads all points
            PlateDeformation.deform(self);

            return self;
        };
    };

    return {
        new: function (size, roughness, numPlates) {
            var world = new _World(size, roughness, numPlates);
            return world.build();
        }
    };
})();


var PlateDeformation = (function () {
    var deform = function (world) {
        var tectonics = TectonicsMap.new(world.size);
        tectonics.onPlatePoint(function(point, plate) {
            var tile = world.getTile(point);
            tile.plate = plate;
            if (plate.density == 3) {
                world.lowerTerrain(point)
            }
        });
        tectonics.onPlateEdge(function(point, plate) {
            var tile = world.getTile(point);
            tile.isPlateEdge = true;
        });
        tectonics.initPlates(world.numPlates);
        tectonics.build(10, false, true);
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


var TerrainFilter = (function () {
    var idMap = [
        { id: 0, height: 0, color: "#000056", name: "Abyssal waters", isWater: true },
        { id: 1, height: 80, color: "#1a3792", name: "Deep waters", isWater: true },
        { id: 2, height: 120, color: "#3379a6", name: "Shallow waters", isWater: true },
        { id: 3, height: 150, color: "#0a5816", name: "Coastal plains" },
        { id: 4, height: 190, color: "#31771a", name: "Plains" },
        { id: 5, height: 235, color: "#7ac85b", name: "Hills" },
        { id: 6, height: 250, color: "#7d7553", name: "Mountains" },
        { id: 7, height: 256, color: "#FFF", name: "Peaks" }
    ];

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
        getTerrainbyId: getTerrainbyId
    };
})();
