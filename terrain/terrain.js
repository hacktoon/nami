
var TerrainSpecParser = (function () {

})();


var TerrainMap = (function(){
    var _TerrainMap = function () {
        var self = this;

        this.idMap = [
            { height: 0,   color: "#000056", name: "Abyssal waters", isWater: true },
            { height: 60,  color: "#1a3792", name: "Deep waters",    isWater: true},
            { height: 110, color: "#489CFF", name: "Shallow waters", isWater: true},
            { height: 130, color: "#0a5816", name: "Coastal plains"    },
            { height: 170, color: "#31771a", name: "Plains"    },
            { height: 225, color: "#7ac85b", name: "Hills"     },
            { height: 240, color: "#7d7553", name: "Mountains" },
            { height: 254, color: "#FFF",    name: "Peaks"     }
        ];

        this.getTerrainByHeight = function(height){
            var terrain;
            _.each(self.idMap, function (candidade) {
                if (height >= candidade.height) {
                    terrain = candidade;
                }
            });
            return terrain;
        };
    };

    return {
        new: function() {
            var terrain = new _TerrainMap();
            return terrain;
        }
    };
})();
