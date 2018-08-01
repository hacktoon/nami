var canvas = document.getElementById("surface"),
    ctx = canvas.getContext("2d"),
    totalPlatesInput = document.getElementById("totalPlates"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow"),
    drawEdgesCheckbox = document.getElementById("drawEdges"),
    edgeColorInput = document.getElementsByClassName("edgeColor"),
    growthRateInput = document.getElementById("growthRate"),
    partialGrowCheckbox = document.getElementById("partialGrow"),
    growLotteryCheckbox = document.getElementById("growLottery");

var TILESIZE = 4;

var grid = Grid.new(128, 128),
    maxPlates = _.toNumber((grid.width * grid.height) / 4),
    maxGrowthRate = 10,
    plates = [],
    platesColorMap = {},
    plateRegionMap = {};

var colorMap = function() {
    var colors = [];
    _.times(getTotalPlates(), function() {
        colors.push(RandomColor());
    })
    return colors;
};

var Plate = (function() {
    var _Plate = function(id) {
        this.id = id;
        this.points = [];
        this.speed = _.sample([1, 2, 3, 4, 5]);
        this.weight = _.sample([1, 2]);
        this.direction = Direction.random();
    };

    return {
        _class: _Plate,
        new: function(id) {
            return new _Plate(id);
        }
    };
})();

var createPlates = function(grid, totalPlates) {
    var points = grid.randomPoints(totalPlates),
        plates = [];

    _.times(totalPlates, function(index) {
        var plate = Plate.new(index),
            region = GridFill.new(grid, index);

        region.seed(points[index]);
        plateRegionMap[index] = region;
        plates.push(plate);
    });
    return plates;
};

var drawPoint = function(point, color) {
    var point = grid.wrap(point);

    ctx.fillStyle = color;
    ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
};

var drawEdgesByDirection = function(direction, color, regionId) {
    if (_.isNumber(regionId)) {
        plateRegionMap[regionId].edgesByDirection(direction, function(point) {
            drawPoint(point, color);
        });
    } else {
        _.each(plateRegionMap, function(region, id) {
            region.edgesByDirection(direction, function(point) {
                drawPoint(point, color);
            });
        });
    }
};

var drawEdges = function(color, regionId) {
    if (_.isNumber(regionId)) {
        plateRegionMap[regionId].edges(function(point) {
            drawPoint(point, color);
        });
    }
    _.each(plateRegionMap, function(region, id) {
        region.edges(function(point) {
            drawPoint(point, color);
        });
    });
};

var draw = function(grid) {
    canvas.width = grid.width * TILESIZE;
    canvas.height = grid.height * TILESIZE;

    grid.forEach(function(value, point) {
        ctx.fillStyle = platesColorMap[value] || '#FFF';
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });

    if (drawEdgesCheckbox.checked) {
        _.each(edgeColorInput, function(input) {
            var direction = Direction[input.id];
            drawEdgesByDirection(direction, input.value || 'black');
        });
    }
};

var grow = function(region) {
    region.grow({
        partial: partialGrowCheckbox.checked,
        times: getGrowthRate(),
        chance: growLotteryCheckbox.checked
    });
};

var autoGrow = function() {
    var totalCompleted = 0,
        completedMap = {},
        totalPlates = getTotalPlates();

    while (totalCompleted != totalPlates) {
        plates.forEach(function(plate) {
            var region = plateRegionMap[plate.id];
            if (region.isComplete()) {
                totalCompleted += Boolean(completedMap[plate.id]) ? 0 : 1;
                completedMap[plate.id] = 1;
                return;
            }
            grow(region);
        });
    }
};

var reset = function() {
    grid.reset();
    plateRegionMap = {};
    init();
};

var init = function() {
    platesColorMap = colorMap();
    plates = createPlates(grid, getTotalPlates());
};

var getTotalPlates = function() {
    var value = _.clamp(totalPlatesInput.value, 1, maxPlates);

    totalPlatesInput.value = value;
    return value;
};

var getGrowthRate = function() {
    var value = _.clamp(growthRateInput.value, 1, maxGrowthRate);

    growthRateInput.value = value;
    return value;
};

drawEdgesCheckbox.addEventListener('click', function() {
    draw(grid);
});

_.each(edgeColorInput, function(input) {
    var direction = Direction[input.id];
    input.addEventListener('change', function(e) {
        if (drawEdgesCheckbox.checked) {
            drawEdgesByDirection(direction, input.value);
        }
    });
});

generateButton.addEventListener('click', function() {
    reset();
    autoGrow();
    draw(grid);
});

resetButton.addEventListener('click', function() {
    reset();
    draw(grid);
});

growButton.addEventListener('click', function() {
    plates.forEach(function(plate) {
        grow(plateRegionMap[plate.id]);
    });
    draw(grid);
});

init();
draw(grid);