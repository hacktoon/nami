var canvas = document.getElementById("surface"),
    mapCtx = canvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    sizeInput = document.getElementById("size"),
    seaLevelInput = document.getElementById("seaLevel"),
    surfaceViewInput = document.getElementById("surface-button"),
    moistureViewInput = document.getElementById("moisture-button"),
    tectonicsViewInput = document.getElementById("tectonics-button"),
    infoPanel = document.getElementById("info");

var TILESIZE = 5;

var heightmapColorMap = {},
    moistureColorMap = {},
    tectonicsPainter = undefined;

var createWorld = function(){
    var size = Number(sizeInput.value),
        roughness = Number(roughnessInput.value),
        seaLevel = Number(seaLevelInput.value);
    var world = World.new(size, roughness, seaLevel);
    tectonicsPainter = TectonicsPainter.new(world.tectonicsMap, canvas, TILESIZE);
    return world;
};

var world = createWorld();

generateButton.addEventListener('click', function() {
    world = createWorld();
    seaLevelInput.value = world.seaLevel;
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

surfaceViewInput.addEventListener('click', function() {
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

moistureViewInput.addEventListener('click', function() {
    drawMap(mapCtx, world.moistureMap, {colorMap: moistureColorMap});
});

tectonicsViewInput.addEventListener('click', function() {
    tectonicsPainter.draw();
    //tectonicsPainter.drawEdges();
});

seaLevelInput.addEventListener('change', function() {
    world.seaLevel = seaLevelInput.value;
    generateSurfaceColorMap();
    drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
});

canvas.addEventListener('mousemove', function(e) {
    var mouseX = e.clientX - canvas.offsetLeft,
        mouseY = e.clientY - canvas.offsetTop,
        x = _.parseInt(mouseX / TILESIZE),
        y = _.parseInt(mouseY / TILESIZE),
        point = Point.new(x, y),
        height = world.heightMap.get(point),
        moisture = world.moistureMap.get(point),
        text = "(x: "+ x + ", y: " + y + ") = " + "Height: " + height + ",  Moisture: " + moisture;
    infoPanel.innerHTML = text;
});

generateSurfaceColorMap();
generateMoistureColorMap();
drawMap(mapCtx, world.heightMap, {colorMap: heightmapColorMap});
