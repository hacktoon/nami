var canvas = document.getElementById("surface"),
    mapCtx = canvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    sizeInput = document.getElementById("size"),
    seaLevelInput = document.getElementById("seaLevel"),
    totalPlatesInput = document.getElementById("totalPlates"),
    tilesizeInput = document.getElementById("tilesize"),
    infoPanel = document.getElementById("info"),
    viewRadio = document.getElementsByName('view'),
    currentView = "surface";

var heightmapColorMap = {},
    moistureColorMap = {},
    tectonicsPainter = undefined;

var createWorld = function(){
    var size = Number(sizeInput.value),
        roughness = Number(roughnessInput.value),
        seaLevel = Number(seaLevelInput.value),
        totalPlates = Number(totalPlatesInput.value);

    var world = World.new(size, roughness, seaLevel, totalPlates);
    tectonicsPainter = TectonicsPainter.new(world.tectonicsMap, canvas, getTileSize());
    return world;
};

var getTileSize = function(){
    return Number(tilesizeInput.value)
};

var world = createWorld();

var viewOptions = {
    surface: function () {
        drawMap(mapCtx, world.heightMap, { colorMap: heightmapColorMap });
    },
    moisture: function () {
        drawMap(mapCtx, world.moistureMap, { colorMap: moistureColorMap });
    },
    tectonics: function () {
        tectonicsPainter.draw();
        //tectonicsPainter.drawEdges();
    }
};

viewRadio.forEach(function(radio) {
    radio.addEventListener('click', function (e) {
        currentView = e.target.value;
        draw();
    });
});


var draw = function() {
    viewOptions[currentView]();
}

generateButton.addEventListener('click', function() {
    world = createWorld();
    seaLevelInput.value = world.seaLevel;
    draw();
});

seaLevelInput.addEventListener('change', function() {
    world.seaLevel = seaLevelInput.value;
    generateSurfaceColorMap();
    draw();
});

canvas.addEventListener('mousemove', function(e) {
    var mouseX = e.clientX - canvas.offsetLeft,
        mouseY = e.clientY - canvas.offsetTop,
        x = _.parseInt(mouseX / getTileSize()),
        y = _.parseInt(mouseY / getTileSize()),
        point = Point.new(x, y),
        height = world.heightMap.get(point),
        moisture = world.moistureMap.get(point),
        text = "(x: "+ x + ", y: " + y + ") = " + "Height: " + height + ",  Moisture: " + moisture;
    infoPanel.innerHTML = text;
});

generateSurfaceColorMap();
generateMoistureColorMap();
draw();
