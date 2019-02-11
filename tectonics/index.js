var canvas = document.getElementById("world"),
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

var TILESIZE = 4,
    SIZE = 128,
    MAXPLATES = _.toNumber((SIZE * SIZE) / 4),
    MAXGROWTHRATE = 20;
    tectonics = undefined,
    painter = undefined;

var createTectonics = function() {
    tectonics = Tectonics.new(SIZE, getTotalPlates());
    painter = TectonicsPainter.new(tectonics, canvas, TILESIZE);
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
    painter.draw(drawLabelsCheckbox.checked);
    if (drawEdgesCheckbox.checked) {
        _.each(edgeColorInput, function (input) {
            var direction = Direction[input.id];
            painter.drawEdgesByDirection(direction, input.value || '#000');
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
            painter.drawEdges(input.value || '#000');
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

init();
