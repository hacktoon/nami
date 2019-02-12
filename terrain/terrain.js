
var TerrainMap = (function(){
    var _TerrainMap = function (size, roughness) {
        var self = this;
        this.size = size;

        this.grid = HeightMap(size, roughness);
        this.codeMap = {
            1: {height: 0,   color: "#000056", name: "Abyssal water"},
            2: {height: 50,  color: "#1a3792", name: "Deep water"   },
            3: {height: 90,  color: "#489CFF", name: "Shallow water"},
            4: {height: 120, color: "#0a5816", name: "Coast"        },
            5: {height: 170, color: "#31771a", name: "Plain"        },
            6: {height: 205, color: "#7ac85b", name: "Plateau"      },
            7: {height: 230, color: "#7d7553", name: "Hill"         },
            8: {height: 250, color: "#AAA",    name: "Mountain"     },
            9: {height: 254, color: "#FFF",    name: "Peak"         }
        };
    };

    return {
        new: function(size, roughness) {
            return new _TerrainMap(size, roughness);
        }
    };
})();

