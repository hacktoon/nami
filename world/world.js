

// var WorldBuilder = (function () {})();


var World = (function(){
    var _World = function (size, roughness, seaLevel, totalPlates){
        var self = this;
        this.size = size;
        this.heightMap = undefined;
        this.terrainMap = {
            1: {name: "abyssal",  rate: 10},
            2: {name: "deep",     rate: 10},
            3: {name: "shallow",  rate: 10},
            4: {name: "coast",    rate: 10},
            5: {name: "plain",    rate: 10},
            6: {name: "plateau",  rate: 10},
            7: {name: "hill",     rate: 10},
            8: {name: "mountain", rate: 5},
        };
        this.moistureMap = undefined;
        this.tectonicsMap = undefined;
        this.roughness = roughness;
        this.totalPlates = totalPlates;
        this.seaLevel = seaLevel;
        self.data = {
            water: 0,
            land: 0
        };

        var _generateTectonicsMap = function() {
            var tectonics = Tectonics.new(self.size, self.totalPlates);
            tectonics.buildPlates();
            self.tectonicsMap = tectonics;
        };

        var _generateHeightMap = function() {
            var setPoint = function(grid, point, height){
                if (self.tectonicsMap.hasPointInEdges(point)) {
                    var deformation = self.tectonicsMap.getDeformation(point),
                        height = _.clamp(height + deformation, 0, self.size);
                    grid.set(point, height);
                }
            };
            var heightmap = HeightMap(self.size, self.roughness, {callback: setPoint});
            heightmap = WorldFilter.average(heightmap);
            heightmap = WorldFilter.normalizeHeight(heightmap, self.seaLevel);
            //heightmap = WorldFilter.trimPoints(heightmap); --> needs terrain level info %
            self.heightMap = heightmap;
        };

        var _generateMoistureMap = function() {
            var moistureMap = HeightMap(self.size, self.roughness);
            self.moistureMap = WorldFilter.average(moistureMap);
        };

        this.build = function() {
            _generateTectonicsMap();
            _generateHeightMap();
            _generateMoistureMap();
        };
    };

    return {
        new: function(size, roughness, seaLevel, totalPlates) {
            var world = new _World(size, roughness, seaLevel, totalPlates);
            world.build();
            return world;
        }
    };
})();



var WorldFilter = (function(){
    var average = function(originalGrid) {
        var grid = _.cloneDeep(originalGrid);
        originalGrid.forEach(function(_, point) {
            var neighborhood = PointNeighborhood.new(point),
                totalNeighbors = 0,
                sum = 0;

                neighborhood.around(function(point) {
                    var value = originalGrid.get(point);
                    if (value != undefined) {
                        sum += originalGrid.get(point);
                        totalNeighbors++;
                    }
                });
            grid.set(point, Math.round(sum / totalNeighbors));
        });
        return grid;
    };

    var normalizeHeight = function(grid, seaLevel) {
        grid.forEach(function(originalValue, point) {
            var height = 1;
            if (originalValue > 40)             { height = 2; }
            if (originalValue > 80)             { height = 3; }
            if (originalValue > seaLevel)       { height = 4; }
            if (originalValue > seaLevel + 50)  { height = 5; }
            if (originalValue > seaLevel + 85)  { height = 6; }
            if (originalValue > seaLevel + 110) { height = 7; }
            if (originalValue > seaLevel + 130) { height = 8; }
            grid.set(point, height);
        });
        return grid;
    };

    var trimPoints = function(originalGrid) {
        var grid = _.cloneDeep(originalGrid);
        originalGrid.forEach(function(originalValue, point) {
            var neighborhood = PointNeighborhood.new(point),
                differentNeighbors = 0,
                newValue = originalValue;
                neighborhood.around(function(neighborPoint) {
                    var value = originalGrid.get(neighborPoint);
                    if (value != originalValue) {
                        differentNeighbors++;
                        newValue = value;
                    }
                });
            if (differentNeighbors > 3){
                grid.set(point, newValue);
            }
        });
        return grid;
    };

    return {
        average: average,
        trimPoints: trimPoints,
        normalizeHeight: normalizeHeight
    };

})();
