var viewCanvas = document.getElementById("world"),
    numPlatesInput = document.getElementById("numPlates"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow"),
    growthRateInput = document.getElementById("growthRate"),
    partialGrowCheckbox = document.getElementById("partialGrow"),
    growLotteryCheckbox = document.getElementById("growLottery"),
    drawLabelsCheckbox = document.getElementById("drawLabels");

var TILESIZE = 3,
    SIZE = 256,
    tectonics = undefined,
    painter = undefined;

var createTectonics = function() {
    tectonics = TectonicsMap.new(SIZE, getTotalPlates());
    painter = TectonicsPainter.new(viewCanvas);
};


var getTotalPlates = function() {
    var value = Number(numPlatesInput.value);
    numPlatesInput.value = value;
    return value;
};

var getGrowthRate = function() {
    var value = Number(growthRateInput.value);
    growthRateInput.value = value;
    return value;
};

var draw = function () {
    viewCanvas.width = tectonics.grid.width * TILESIZE;
    viewCanvas.height = tectonics.grid.height * TILESIZE;
    painter.draw(tectonics, TILESIZE);
};

var init = function () {
    createTectonics();
    draw();
};

generateButton.addEventListener('click', function() {
    createTectonics();
    var isPartial = partialGrowCheckbox.checked;
    var times = getGrowthRate();
    var chance = growLotteryCheckbox.checked;
    tectonics.build(times, chance, isPartial);
    draw();
});

drawLabelsCheckbox.addEventListener('click', draw);
resetButton.addEventListener('click', init);

growButton.addEventListener('click', function() {
    var isPartial = partialGrowCheckbox.checked;
    var times = getGrowthRate();
    var chance = growLotteryCheckbox.checked;
    tectonics.forEachPlate(function(plate) {
        plate.region.grow(times, chance, isPartial);
    });
    draw();
});

generateButton.click();
