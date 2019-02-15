
var TerrainMap = (function(){
    var _TerrainMap = function (size, roughness) {
        var self = this;

        this.size = size;
        this.heightMap = HeightMap.new(size, roughness);
        this.idMap = [
            { height: 0,   color: "#000056", name: "Abyssal water", water: true },
            { height: 60,  color: "#1a3792", name: "Deep water",    water: true},
            { height: 110, color: "#489CFF", name: "Shallow water", water: true},
            { height: 130, color: "#0a5816", name: "Coast"    },
            { height: 170, color: "#31771a", name: "Plain"    },
            { height: 225, color: "#7ac85b", name: "Hill"     },
            { height: 240, color: "#7d7553", name: "Mountain" },
            { height: 254, color: "#FFF",    name: "Peak"     }
        ];

        this.build = function(callback){
            self.heightMap.build(callback);
        };

        this.getNormalizedHeight = function(rawHeight){
            var height = 0;
            _.each(self.idMap, function (terrain, index) {
                if (rawHeight >= terrain.height) {
                    height = index;
                }
            });
            return height;
        };
    };

    return {
        new: function(size, roughness) {
            var terrain = new _TerrainMap(size, roughness);
            terrain.build(function (value, point){  })
            return terrain;
        }
    };
})();
