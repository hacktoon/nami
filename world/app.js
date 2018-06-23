var mapCanvas = document.getElementById("canvas"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    waterLevelInput = document.getElementById("waterLevel"),
    mapViewInput = document.getElementById("map-view"),
    infoPanel = document.getElementById("info");

var TILESIZE = 6;

var world = World.new(128);

var heightmapColorMap = {};
var moistureColorMap = {};


var generateWorldColorMap = function() {
    var water = ColorGradient('0052AF', '005FCA', world.waterLevel),
        ground = ColorGradient('008900', '00d000', 100 - world.waterLevel);
    _.concat(water, ground).forEach(function(item, index) {
        heightmapColorMap[index] = item;
    });
};

generateWorldColorMap();

ColorGradient('CC0000', '0000CC', 100).forEach(function(item, index) {
    moistureColorMap[index] = item;
});


var drawMap = function(ctx, grid, opts){
    var opts = opts || {};

    grid.forEach(function(currentValue, point){
        ctx.fillStyle = opts.colorMap[currentValue];
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};


generateButton.addEventListener('click', function() {
    world.roughness = Number(roughnessInput.value);
    world.build();
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

mapViewInput.addEventListener('change', function(e) {
    var mapView = e.target.selectedOptions[0].value;
    if (mapView === 'moisture'){
        drawMap(mapCtx, world.moistureMap, {colorMap: moistureColorMap});
    } else {
        drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
    }
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
    var text = "(x: "+ x + ", y: " + y + ")<br/>" + "Height: " + height + ",  Moisture: " + moisture;
    infoPanel.innerHTML = text;
});

roughnessInput.value = world.roughness;

mapCanvas.width = world.size * TILESIZE;
mapCanvas.height = world.size * TILESIZE;

world.build();
drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});