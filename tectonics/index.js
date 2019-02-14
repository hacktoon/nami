var viewCanvas = document.getElementById("world"),
    totalPlatesInput = document.getElementById("totalPlates"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow"),
    drawEdgesCheckbox = document.getElementById("drawEdges"),
    edgeColorInput = document.getElementsByClassName("edgeColor"),
    growthRateInput = document.getElementById("growthRate"),
    partialGrowCheckbox = document.getElementById("partialGrow"),
    growLotteryCheckbox = document.getElementById("growLottery"),
    drawLabelsCheckbox = document.getElementById("drawLabels");

var TILESIZE = 3,
    SIZE = 256,
    MAXPLATES = _.toNumber((SIZE * SIZE) / 4),
    MAXGROWTHRATE = 20;
    tectonics = undefined,
    painter = undefined;

var createTectonics = function() {
    tectonics = TectonicsMap.new(SIZE, getTotalPlates());
    painter = TectonicsPainter.new(viewCanvas);
};

var getGrowOptions = function() {
    return {
        partial: partialGrowCheckbox.checked,
        times: getGrowthRate(),
        chance: growLotteryCheckbox.checked
    };
};

var getTotalPlates = function() {
    var value = _.clamp(totalPlatesInput.value, 1, MAXPLATES);
    totalPlatesInput.value = value;
    return value;
};

var getGrowthRate = function() {
    var value = _.clamp(growthRateInput.value, 1, MAXGROWTHRATE);
    growthRateInput.value = value;
    return value;
};

var draw = function () {
    viewCanvas.width = tectonics.grid.width * TILESIZE;
    viewCanvas.height = tectonics.grid.height * TILESIZE;

    painter.draw(tectonics, TILESIZE);
    if (drawEdgesCheckbox.checked) {
        _.each(edgeColorInput, function (input) {
            var direction = Direction[input.id];
            painter.drawEdgesByDirection(direction, input.value, TILESIZE);
        });
    }
};

var init = function () {
    createTectonics();
    draw();
};

_.each(edgeColorInput, function(input) {
    var direction = Direction[input.id];
    input.addEventListener('change', function(e) {
        if (drawEdgesCheckbox.checked) {
            painter.drawEdges(input.value, TILESIZE);
        }
    });
});

generateButton.addEventListener('click', function() {
    createTectonics();
    tectonics.buildPlates(getGrowOptions());
    draw();
});

drawLabelsCheckbox.addEventListener('click', draw);
drawEdgesCheckbox.addEventListener('click', draw);
resetButton.addEventListener('click', init);

growButton.addEventListener('click', function() {
    tectonics.forEachPlate(function(plate) {
        plate.region.grow(getGrowOptions());
    });
    draw();
});

generateButton.click();
