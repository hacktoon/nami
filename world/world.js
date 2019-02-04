
var WorldMapAnalysis = function(){

};


var World = (function(){
    var _World = function(size, roughness, seaLevel){
        var self = this;
        this.size = size;
        this.heightRange = Range.new(0, size);
        this.heightMap = undefined;
        this.moistureMap = undefined;
        this.tectonicsMap = undefined;
        this.roughness = roughness;
        this.totalPlates = 8;
        this.seaLevel = seaLevel;
        self.data = {
            water: 0,
            land: 0
        };

        var _generateTectonicsMap = function() {
            self.tectonicsMap = Tectonics.new(self.size, self.totalPlates);
        };

        var _generateHeightMap = function() {
            var callback = function(point, height){
                 if (height <= self.seaLevel) {
                    self.data['water'] += 1;
                 } else {
                    self.data['land'] += 1;
                }
            };
            var hmap = HeightMap(self.size, self.heightRange, self.roughness, {callback: callback});
            self.heightMap = GridFilter.average(hmap);
        };

        var _generateMoistureMap = function() {
            var moistureMap = HeightMap(self.size, self.heightRange, self.roughness);
            self.moistureMap = GridFilter.average(moistureMap);
        };

        this.build = function() {
            _generateTectonicsMap();
            _generateHeightMap();
            _generateMoistureMap();
        };
    };

    return {
        new: function(size, roughness, seaLevel) {
            var world = new _World(size, roughness, seaLevel);
            world.build();
            return world;
        }
    };
})();
