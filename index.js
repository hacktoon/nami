var mapCanvas = document.getElementById("surface"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    seaLevelInput = document.getElementById("seaLevel"),
    surfaceViewInput = document.getElementById("surface-button"),
    moistureViewInput = document.getElementById("moisture-button"),
    infoPanel = document.getElementById("info");

var View = {
    TILESIZE: 5
};

var heightmapColorMap = {},
    moistureColorMap = {};

var createWorld = function(){
    return World.new(128, Number(roughnessInput.value), Number(seaLevelInput.value));
};

var world = createWorld();

generateButton.addEventListener('click', function() {
    world = createWorld();
    world.roughness = Number(roughnessInput.value);
    world.build();
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
    seaLevelInput.value = world.seaLevel;
    log("land: " + world.data.land, "water: " + world.data.water);
    if (world.data.land > world.data.water) {
        log('more land');
    } else {
        log('more water');
    }
});

surfaceViewInput.addEventListener('click', function(e) {
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

moistureViewInput.addEventListener('click', function(e) {
    drawMap(mapCtx, world.moistureMap, {colorMap: moistureColorMap});
});

seaLevelInput.addEventListener('change', function(e) {
    world.seaLevel = seaLevelInput.value;
    generateSurfaceColorMap();
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
seaLevelInput.value = world.seaLevel;

mapCanvas.width = world.size * View.TILESIZE;
mapCanvas.height = world.size * View.TILESIZE;

generateSurfaceColorMap();
generateMoistureColorMap();
world.build();
drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
