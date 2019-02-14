
var TerrainMap = (function(){
    var _TerrainMap = function (size, roughness) {
        var self = this;
        this.size = size;

        this.grid = HeightMap(size, roughness);
        this.idMap = {
            1: {height: 0,   color: "#000056", name: "Abyssal water", water: true },
            2: { height: 60, color: "#1a3792", name: "Deep water", water: true},
            3: { height: 110, color: "#489CFF", name: "Shallow water", water: true},
            4: { height: 130, color: "#0a5816", name: "Coast"       },
            5: {height: 170, color: "#31771a", name: "Plain"        },
            6: { height: 225, color: "#7ac85b", name: "Hill"         },
            7: { height: 240, color: "#7d7553",    name: "Mountain"     },
            9: {height: 254, color: "#FFF",    name: "Peak"         }
        };
    };

    return {
        new: function(size, roughness) {
            return new _TerrainMap(size, roughness);
        }
    };
})();
