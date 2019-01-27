
var WorldMapAnalysis = function(){

};


var World = (function(){
    var _World = function(size, roughness, seaLevel){
        var self = this;
        this.size = size;
        this.heightMap = Grid.new(size, size);
        this.heightRange = Range.new(0, 100);
        this.moistureMap = Grid.new(size, size);
        this.roughness = roughness;
        this.seaLevel = seaLevel;
        self.data = {
            water: 0,
            land: 0
        };

        this.generateHeightMap = function() {
            var callback = function(point, height){
                 if (height <= self.seaLevel) {
                    self.data['water'] += 1;
                 } else {
                    self.data['land'] += 1;
                }
            };
            var heightMap = HeightMap(this.size, this.heightRange, this.roughness, {callback: callback});
            this.heightMap = GridFilter.average(heightMap);
        };

        this.generateMoistureMap = function() {
            var moistureMap = HeightMap(this.size, this.heightRange, this.roughness);
            this.moistureMap = GridFilter.average(moistureMap);
        };

        this.build = function() {
            this.generateHeightMap();
            this.generateMoistureMap();
        };
    };

    return {
        new: function(size, roughness, seaLevel) {
            return new _World(size, roughness, seaLevel);
        }
    };
})();
