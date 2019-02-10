var canvas = document.getElementById("surface"),
    canvasCtx = canvas.getContext("2d"),
    generateButton = document.getElementById("generateButton"),
    roughnessInput = document.getElementById("roughness"),
    sizeInput = document.getElementById("size"),
    totalPlatesInput = document.getElementById("totalPlates"),
    tilesizeInput = document.getElementById("tilesize"),
    infoPanel = document.getElementById("info"),
    viewInput = document.getElementById('viewInput');

var moistureColorMap = {},
    tectonicsPainter = undefined;

var createWorld = function(){
    var size = Number(sizeInput.value),
        roughness = Number(roughnessInput.value),
        totalPlates = Number(totalPlatesInput.value),
        tilesize = getTileSize();

    var world = World.new(size, roughness, totalPlates);
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
            drawMap(canvasCtx, world.heightMap);
        },
        moisture: function () {
            drawMap(canvasCtx, world.moistureMap, { colorMap: moistureColorMap });
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
    draw();
});

var getCanvasMousePoint = function(e, canvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - canvas.offsetLeft,
        mouseY = e.clientY - canvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSize()),
        y = _.parseInt(mouseY / getTileSize());
    return Point.new(x, y);
};

canvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, canvas),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = world.heightMap.get(point),
        heightText = " | Height: " + height,
        moisture = " | Moisture: " + world.moistureMap.get(point),
        terrain = " | Terrain: " + world.terrainMap[height].name;

    infoPanel.innerHTML = position + terrain + heightText + moisture;;
});

generateMoistureColorMap();
draw();
