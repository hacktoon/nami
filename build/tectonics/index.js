"use strict";

var viewCanvas = document.getElementById("world"),
    numPlatesInput = document.getElementById("numPlates"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow"),
    growthRateInput = document.getElementById("growthRate"),
    partialGrowCheckbox = document.getElementById("partialGrow"),
    growLotteryCheckbox = document.getElementById("growLottery"),
    drawLabelsCheckbox = document.getElementById("drawLabels");
var TILESIZE = 2,
    SIZE = 256,
    tectonics = undefined,
    painter = new TectonicsPainter(viewCanvas);

var createTectonics = function createTectonics() {
  tectonics = new Tectonics(SIZE, getTotalPlates());
  tectonics.initPlates();
};

var getTotalPlates = function getTotalPlates() {
  var value = Number(numPlatesInput.value);
  numPlatesInput.value = value;
  return value;
};

var getGrowthRate = function getGrowthRate() {
  var value = Number(growthRateInput.value);
  growthRateInput.value = value;
  return value;
};

var draw = function draw() {
  viewCanvas.width = tectonics.grid.width * TILESIZE;
  viewCanvas.height = tectonics.grid.height * TILESIZE;
  painter.draw(tectonics, TILESIZE);
};

var init = function init() {
  createTectonics();
  draw();
};

generateButton.addEventListener('click', function () {
  createTectonics();
  var isPartial = partialGrowCheckbox.checked;
  var times = getGrowthRate();
  var chance = growLotteryCheckbox.checked;
  tectonics.build(times, chance, isPartial);
  draw();
});
drawLabelsCheckbox.addEventListener('click', draw);
resetButton.addEventListener('click', init);
growButton.addEventListener('click', function () {
  var isPartial = partialGrowCheckbox.checked;
  var times = getGrowthRate();
  var chance = growLotteryCheckbox.checked;
  tectonics.plates.forEach(function (plate) {
    if (chance && _.sample([true, false])) return;

    if (isPartial) {
      plate.region.growPartial(times);
    } else {
      plate.region.grow(times);
    }
  });
  draw();
});
generateButton.click();