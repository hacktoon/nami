

// var WorldBuilder = (function () {})();

// var WorldStatistics = (function () {})();

var World = (function(){
    var _World = function (){
        var self = this;
        this.size = 256;
        this.roughness = 3;
        this.heightMap = HeightMap(this.size, this.roughness);
        this.moistureMap = HeightMap(this.size, this.roughness);
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
        new: function() {
            var world = new _World();
            WorldFilter.apply(world);
            return world;
        }
    };
})();



var WorldFilter = (function(){
    var normalizeHeight = function (world, point) {
        var rawHeight = world.heightMap.get(point),
            height = 1;
        _.each(world.terrainMap, function(terrain){
            if (rawHeight >= terrain.height) {
                height = terrain.code;
            }
        });
        return height;
    };

    var apply = function (world) {
        var heightMap = _.cloneDeep(world.heightMap);

        world.heightMap.forEach(function(_, point) {
            var height = normalizeHeight(world, point);
            heightMap.set(point, height);
        });
        world.heightMap = heightMap;
    };

    return {
        apply: apply
    };

})();
