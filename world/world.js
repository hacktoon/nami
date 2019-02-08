

// var WorldBuilder = (function () {})();


var World = (function(){
    var _World = function (size, roughness, seaLevel, totalPlates){
        var self = this;
        this.size = size;
        this.heightMap = undefined;
        this.moistureMap = HeightMap(self.size, self.roughness);
        this.tectonicsMap = undefined;
        this.roughness = roughness;
        this.totalPlates = totalPlates;
        this.seaLevel = seaLevel;
        this.terrainMap = {
            1: { name: "abyssal water", rate: 10 },
            2: { name: "deep water", rate: 10 },
            3: { name: "shallow water", rate: 10 },
            4: { name: "coast", rate: 10 },
            5: { name: "plain", rate: 10 },
            6: { name: "plateau", rate: 10 },
            7: { name: "hill", rate: 10 },
            8: { name: "mountain", rate: 5 },
        };
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
            heightmap = WorldFilter.apply(heightmap, self.seaLevel);
            self.heightMap = heightmap;
        };

        this.build = function() {
            _generateTectonicsMap();
            _generateHeightMap();
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
    var averageNeighbors = function(grid, point) {
        var neighborhood = PointNeighborhood.new(point),
            neighborCount = 0,
            sum = 0;
        neighborhood.around(function (neighbor) {
            var height = grid.get(neighbor);
            if (height != undefined) {
                sum += height;
                neighborCount++;
            }
        });
        return Math.round(sum / neighborCount);
    };

    var normalizeHeight = function (averageHeight, seaLevel) {
        var height = 1;
        if (averageHeight > 50) { height = 2; }
        if (averageHeight > 90) { height = 3; }
        if (averageHeight > seaLevel) { height = 4; }
        if (averageHeight > seaLevel + 50) { height = 5; }
        if (averageHeight > seaLevel + 85) { height = 6; }
        if (averageHeight > seaLevel + 110) { height = 7; }
        if (averageHeight > seaLevel + 140) { height = 8; }
        return height;
    };

    var apply = function (originalGrid, seaLevel) {
        var newGrid = _.cloneDeep(originalGrid);

        originalGrid.forEach(function(_, point) {
            var averageHeight = averageNeighbors(originalGrid, point);
            var height = normalizeHeight(averageHeight, seaLevel);
            newGrid.set(point, height);
        });
        return newGrid;
    };

    var trimPoints = function(grid) {
        grid.forEach(function(originalValue, point) {
            var neighborhood = PointNeighborhood.new(point),
                differentNeighbors = 0,
                newValue = originalValue;
                neighborhood.around(function(neighborPoint) {
                    var value = grid.get(neighborPoint);
                    if (value != originalValue) {
                        differentNeighbors++;
                        newValue = value;
                    }
                });
            if (differentNeighbors > 6){
                grid.set(point, newValue);
            }
        });
        return grid;
    };

    return {
        apply: apply
    };

})();
