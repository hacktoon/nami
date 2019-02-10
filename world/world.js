

// var WorldBuilder = (function () {})();

// var WorldStatistics = (function () {})();

var World = (function(){
    var _World = function (size, roughness){
        var self = this;
        this.size = size;
        this.roughness = roughness;
        this.heightMap = HeightMap(size, roughness);
        this.moistureMap = HeightMap(size, roughness);
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
    };

    return {
        new: function(size, roughness) {
            var world = new _World(size, roughness);
            world.heightMap = WorldFilter.apply(world, world.heightMap);
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

    return {
        apply: apply
    };

})();
