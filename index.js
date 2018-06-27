var mapCanvas = document.getElementById("surface"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    waterLevelInput = document.getElementById("waterLevel"),
    surfaceViewInput = document.getElementById("surface-button"),
    moistureViewInput = document.getElementById("moisture-button"),
    infoPanel = document.getElementById("info");

var View = {
    TILESIZE: 5
};

var world = World.new(128);

var heightmapColorMap = {},
    moistureColorMap = {};

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
    var mouseX = e.clientX - mapCanvas.offsetLeft,
        mouseY = e.clientY - mapCanvas.offsetTop,
        x = _.parseInt(mouseX / View.TILESIZE),
        y = _.parseInt(mouseY / View.TILESIZE),
        point = Point.new(x, y),
        height = world.heightMap.get(point),
        moisture = world.moistureMap.get(point),
        text = "(x: "+ x + ", y: " + y + ") = " + "Height: " + height + ",  Moisture: " + moisture;
    infoPanel.innerHTML = text;
});

roughnessInput.value = world.roughness;
waterLevelInput.value = world.waterLevel;

mapCanvas.width = world.size * View.TILESIZE;
mapCanvas.height = world.size * View.TILESIZE;

generateWorldColorMap();
generateMoistureColorMap();
world.build();
drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});