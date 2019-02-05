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

var tectonics = undefined,
    size = 128,
    maxPlates = _.toNumber((size * size) / 4),
    maxGrowthRate = 10,
    platesColorMap = {};


var drawPoint = function(point, color) {
    var point = tectonics.grid.wrap(point);

    ctx.fillStyle = color;
    ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
};

var drawEdgesByDirection = function(direction, color, regionId) {
    if (_.isNumber(regionId)) {
        var region = tectonics.plateRegionMap[regionId];
        region.edgesByDirection(direction, function(point) {
            drawPoint(point, color);
        });
    } else {
        _.each(tectonics.plateRegionMap, function(region, id) {
            region.edgesByDirection(direction, function(point) {
                drawPoint(point, color);
            });
        });
    }
};

var drawEdges = function(color, regionId) {
    if (_.isNumber(regionId)) {
        tectonics.plateRegionMap[regionId].edges(function(point) {
            drawPoint(point, color);
        });
    }
    _.each(tectonics.plateRegionMap, function(region, id) {
        region.edges(function(point) {
            drawPoint(point, color);
        });
    });
};

var draw = function (tectonics) {
    var grid = tectonics.grid;
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
    draw(tectonics);
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
    init();
    tectonics.buildPlates();
    draw(tectonics);
});

resetButton.addEventListener('click', function() {
    init();
    draw(tectonics);
});

growButton.addEventListener('click', function() {
    tectonics.plates.forEach(function(plate) {
        grow(tectonics.plateRegionMap[plate.id]);
    });
    draw(tectonics);
});

var init = function () {
    platesColorMap = generateColorMap();
    tectonics = Tectonics.new(size, getTotalPlates());
};

var generateColorMap = function () {
    var colors = [];
    _.times(getTotalPlates(), function () {
        colors.push(RandomColor());
    })
    return colors;
};

init();
draw(tectonics);
