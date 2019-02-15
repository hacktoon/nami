var viewCanvas = document.getElementById("world"),
    totalPlatesInput = document.getElementById("totalPlates"),
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

var getGrowOptions = function() {
    return {
        partial: partialGrowCheckbox.checked,
        times: getGrowthRate(),
        chance: growLotteryCheckbox.checked
    };
};

var getTotalPlates = function() {
    var value = Number(totalPlatesInput.value);
    totalPlatesInput.value = value;
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
    tectonics.buildPlates(getGrowOptions());
    draw();
});

drawLabelsCheckbox.addEventListener('click', draw);
resetButton.addEventListener('click', init);

growButton.addEventListener('click', function() {
    tectonics.forEachPlate(function(plate) {
        plate.region.grow(getGrowOptions());
    });
    draw();
});

generateButton.click();
