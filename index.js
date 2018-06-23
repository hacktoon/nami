var mapCanvas = document.getElementById("surface"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    waterLevelInput = document.getElementById("waterLevel"),
    surfaceViewInput = document.getElementById("surface-button"),
    moistureViewInput = document.getElementById("moisture-button"),
    infoPanel = document.getElementById("info");

var TILESIZE = 5;

var world = World.new(128);

var heightmapColorMap = {},
    moistureColorMap = {};

var generateWorldColorMap = function() {
    var water = ColorGradient('0052AF', '005FCA', world.waterLevel),
        ground = ColorGradient('008900', '00d000', 100 - world.waterLevel);
    _.concat(water, ground).forEach(function(item, index) {
        heightmapColorMap[index+1] = item;
    });
};

var generateMoistureColorMap = function() {
    ColorGradient('CC0000', '0000CC', 100).forEach(function(item, index) {
        moistureColorMap[index] = item;
    });
};

generateButton.addEventListener('click', function() {
    world.roughness = Number(roughnessInput.value);
    world.build();
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

surfaceViewInput.addEventListener('click', function(e) {
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

moistureViewInput.addEventListener('click', function(e) {
    drawMap(mapCtx, world.moistureMap, {colorMap: moistureColorMap});
});

waterLevelInput.addEventListener('change', function(e) {
    world.waterLevel = waterLevelInput.value;
    generateWorldColorMap();
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

mapCanvas.addEventListener('mousemove', function(e) {
    var x = _.parseInt((e.clientX - mapCanvas.offsetLeft) / TILESIZE),
        y = _.parseInt((e.clientY - mapCanvas.offsetTop) / TILESIZE);
        point = Point.new(x, y),
        height = world.heightMap.get(point),
        moisture = world.moistureMap.get(point);
    var text = "(x: "+ x + ", y: " + y + ") = " + "Height: " + height + ",  Moisture: " + moisture;
    infoPanel.innerHTML = text;
});

roughnessInput.value = world.roughness;
waterLevelInput.value = world.waterLevel;

mapCanvas.width = world.size * TILESIZE;
mapCanvas.height = world.size * TILESIZE;

generateWorldColorMap();
generateMoistureColorMap();
world.build();
drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});