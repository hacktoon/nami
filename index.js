var mapCanvas = document.getElementById("surface"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    sizeInput = document.getElementById("size"),
    seaLevelInput = document.getElementById("seaLevel"),
    surfaceViewInput = document.getElementById("surface-button"),
    moistureViewInput = document.getElementById("moisture-button"),
    tectonicsViewInput = document.getElementById("tectonics-button"),
    infoPanel = document.getElementById("info");

var View = {
    TILESIZE: 5
};

var heightmapColorMap = {},
    moistureColorMap = {};

var createWorld = function(){
    return World.new(Number(sizeInput.value), Number(roughnessInput.value), Number(seaLevelInput.value));
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

tectonicsViewInput.addEventListener('click', function(e) {
    //drawMap(mapCtx, world.tectonicsMap, {colorMap: tectonicsColorMap});
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

generateSurfaceColorMap();
generateMoistureColorMap();
world.build();
drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
