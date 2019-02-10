

// var WorldBuilder = (function () {})();

// var WorldStatistics = (function () {})();

var World = (function(){
    var _World = function (size, roughness, totalPlates){
        var self = this;
        this.size = size;
        this.heightMap = undefined;
        this.moistureMap = HeightMap(self.size, self.roughness);
        this.tectonicsMap = undefined;
        this.roughness = roughness;
        this.totalPlates = totalPlates;
        this.terrainMap = {
            1: {code: 1, height: 0,   name: "abyssal water"},
            2: {code: 2, height: 50,  name: "deep water"   },
            3: {code: 3, height: 90,  name: "shallow water"},
            4: {code: 4, height: 120, name: "coast"        },
            5: {code: 5, height: 170, name: "plain"        },
            6: {code: 6, height: 205, name: "plateau"      },
            7: {code: 7, height: 230, name: "hill"         },
            8: {code: 8, height: 250, name: "mountain"     },
            9: {code: 9, height: 254, name: "peak"         }
        };
        self.data = {
            water: 0,
            land: 0
        };

        var _generateTectonicsMap = function() {
            var tectonics = Tectonics.new(self.size, self.totalPlates);
            tectonics.buildPlates();
            self.tectonicsMap = tectonics;
        };

        var _generateHeightMap = function() {
            var setPoint = function(grid, point, height){
                if (self.tectonicsMap.hasPointInEdges(point)) {
                    var deformation = self.tectonicsMap.getDeformation(point),
                        height = _.clamp(height + deformation, 0, self.size);
                    grid.set(point, height);
                }
            };
            var heightmap = HeightMap(self.size, self.roughness, {callback: setPoint});
            heightmap = WorldFilter.apply(self, heightmap);
            self.heightMap = heightmap;
        };

        this.build = function() {
            //TODO: call tectonics later, to morph discretized terrain
            _generateTectonicsMap();
            _generateHeightMap();
        };
    };

    return {
        new: function(size, roughness, totalPlates) {
            var world = new _World(size, roughness, totalPlates);
            world.build();
            return world;
        }
    };
})();



var WorldFilter = (function(){
    var averageNeighbors = function(grid, point) {
        var neighborhood = PointNeighborhood.new(point),
            neighborCount = 0,
            sum = 0;
        neighborhood.around(function (neighbor) {
            sum += grid.get(neighbor);
            neighborCount++;
        });
        return Math.round(sum / neighborCount);
    };

    var normalizeHeight = function (world, averageHeight) {
        var height = 1;
        _.each(world.terrainMap, function(terrain, key){
            if (averageHeight >= terrain.height) {
                height = key;
            }
        });
        return height;
    };

    var apply = function (world, originalGrid) {
        var newGrid = _.cloneDeep(originalGrid);

        originalGrid.forEach(function(_, point) {
            var averageHeight = averageNeighbors(originalGrid, point);
            var height = normalizeHeight(world, averageHeight);
            newGrid.set(point, height);
        });
        return newGrid;
    };

    var trimPoints = function(grid) {
        grid.forEach(function(originalValue, point) {
            var neighborhood = PointNeighborhood.new(point),
                differentNeighbors = 0,
                newValue = originalValue;
                neighborhood.around(function(neighborPoint) {
                    var value = grid.get(neighborPoint);
                    if (value != originalValue) {
                        differentNeighbors++;
                        newValue = value;
                    }
                });
            if (differentNeighbors > 6){
                grid.set(point, newValue);
            }
        });
        return grid;
    };

    return {
        apply: apply
    };

})();
