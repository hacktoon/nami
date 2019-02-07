var canvas = document.getElementById("surface"),
    mapCtx = canvas.getContext("2d"),
    generateButton = document.getElementById("generateButton"),
    roughnessInput = document.getElementById("roughness"),
    sizeInput = document.getElementById("size"),
    seaLevelInput = document.getElementById("seaLevel"),
    totalPlatesInput = document.getElementById("totalPlates"),
    tilesizeInput = document.getElementById("tilesize"),
    infoPanel = document.getElementById("info"),
    viewInput = document.getElementById('viewInput');

var heightmapColorMap = {},
    moistureColorMap = {},
    tectonicsPainter = undefined;

var createWorld = function(){
    var size = Number(sizeInput.value),
        roughness = Number(roughnessInput.value),
        seaLevel = Number(seaLevelInput.value),
        totalPlates = Number(totalPlatesInput.value),
        tilesize = getTileSize();

    var world = World.new(size, roughness, seaLevel, totalPlates);
    tectonicsPainter = TectonicsPainter.new(world.tectonicsMap, canvas, tilesize);
    return world;
};

var getTileSize = function(){
    return Number(tilesizeInput.value)
};

var world = createWorld();

var getViewOption = function () {
    var input = document.querySelector("#viewInput"),
        option = input.options[input.selectedIndex];
    return option.value;
};

var draw = function () {
    var view = getViewOption();
    return {
        surface: function () {
            drawMap(mapCtx, world.heightMap, { colorMap: heightmapColorMap });
        },
        moisture: function () {
            drawMap(mapCtx, world.moistureMap, { colorMap: moistureColorMap });
        },
        tectonics: function () {
            tectonicsPainter.draw();
            tectonicsPainter.drawEdges();
        }
    }[view]();
}

viewInput.addEventListener('change', draw);

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
