
var World = (function(){
    var _World = function(size){
        this.size = 128;
        this.heightMap = Grid.new(size, size);
        this.heightRange = Range.new(0, 100);
        this.moistureMap = Grid.new(size, size);
        this.roughness = 3.5;
        this.waterLevel = 40;
        this.data = {};

        this.generateHeightMap = function() {
            var heightMap = HeightMap(this.size, this.heightRange, this.roughness);
            this.heightMap = GridFilter.average(heightMap);
        };

        this.generateMoistureMap = function() {
            var moistureMap = HeightMap(this.size, this.heightRange, this.roughness);
            this.moistureMap = GridFilter.average(moistureMap);
        };

        this.erode = function() {
            var edges = this.tiles.atWaterLevel;
        };

        this.generateRivers = function(world) {
            var grid = world.heightMap,
                sproutPoint = _.sample(world.stats.highland);
                headPoint = sproutPoint;

            while(grid.get(headPoint) > world.waterLevel){
                var neighbours = Point.neighborHood(headPoint, 'axials');
                grid.set(headPoint, -5);
                headPoint = _.minBy(neighbours, function(p) { return grid.get(p); });
            }
        };

        this.stats = function(world) {
            world.heightMap.map(function(height, point) {
                if (height > world.heightRange.end - 10){
                    world.stats.highland.push(point);
                }
            });
        };

        this.build = function() {
            this.generateHeightMap();
            this.generateMoistureMap();
        };
    };

    return {
        new: function(size) {
            return new _World(size);
        }
    };
})();