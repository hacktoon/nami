

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
        var self = this;

        this.size = 256;
        this.heightMap = HeightMap(this.size, roughness);
        this.terrainMap = {
            1: {height: 0,   name: "Abyssal water"},
            2: {height: 50,  name: "Deep water"   },
            3: {height: 90,  name: "Shallow water"},
            4: {height: 120, name: "Coast"        },
            5: {height: 170, name: "Plain"        },
            6: {height: 205, name: "Plateau"      },
            7: {height: 230, name: "Hill"         },
            8: {height: 250, name: "Mountain"     },
            9: {height: 254, name: "Peak"         }
        };
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
    var normalizeHeight = function (world,rawHeight) {
        var height = 1;
        _.each(world.terrainMap, function(terrain, code){
            if (rawHeight >= terrain.height) {
                height = code;
            }
        });
        return height;
    };

    var smooth = function (world, point) {
        var neighborhood = PointNeighborhood.new(point),
            neighborCount = 0,
            sum = 0;
        neighborhood.around(function (neighbor) {
            sum += world.heightMap.get(neighbor);
            neighborCount++;
        });
        return Math.round(sum / neighborCount);
    };

    var apply = function (world) {
        var heightMap = _.cloneDeep(world.heightMap),
            height = 0;
        world.heightMap.forEach(function(_, point) {
            height = smooth(world, point);
            height = normalizeHeight(world, height);
            heightMap.set(point, height);
        });
        world.heightMap = heightMap;
    };

    return {
        apply: apply
    };

})();
