var viewCanvas = document.getElementById("viewCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    roughnessInput = document.getElementById("roughnessInput"),
    platesInput = document.getElementById("platesInput"),
    viewInput = document.getElementById('viewInput'),
    infoText = document.getElementById("infoText");

var currentWorld;

var getViewInput = function () {
    var option = viewInput.options[viewInput.selectedIndex];
    return option.value;
};

var getTileSizeInput = function(){
    return Number(tilesizeInput.value)
};

var getRoughnessInput = function(){
    return Number(roughnessInput.value)
};

var getPlatesInput = function () {
    return Number(platesInput.value)
};

var createWorld = function(){
    currentWorld = World.new(getRoughnessInput(), getPlatesInput());
    return currentWorld;
};

var terrainPainter = TerrainPainter.new(viewCanvas),
    tectonicsPainter = TectonicsPainter.new(viewCanvas);
    heatPainter = HeatPainter.new(viewCanvas),
    rainPainter = RainPainter.new(viewCanvas);

var draw = function() {
    var option = getViewInput(),
        tilesize = getTileSizeInput();

    viewCanvas.width = currentWorld.size * tilesize;
    viewCanvas.height = currentWorld.size * tilesize;

    if (option == "tectonics") {
        terrainPainter.drawBlackWhite(currentWorld.terrainMap, tilesize);
        tectonicsPainter.draw(currentWorld.tectonicsMap, tilesize);
    } else if (option == "heat") {
        terrainPainter.drawBlackWhite(currentWorld.terrainMap, tilesize);
        heatPainter.draw(currentWorld.heatMap, tilesize);
    } else if (option == "rain") {
        terrainPainter.drawBlackWhite(currentWorld.terrainMap, tilesize);
        rainPainter.draw(currentWorld.rainMap, tilesize);
    } else {
        terrainPainter.draw(currentWorld.terrainMap, tilesize);
    }
};

var getCanvasMousePoint = function(e, viewCanvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - viewCanvas.offsetLeft,
        mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSizeInput()),
        y = _.parseInt(mouseY / getTileSizeInput());
    return Point.new(x, y);
};

/************ EVENT HANDLING *************************/

viewInput.addEventListener('change', draw);

generateButton.addEventListener('click', function() {
    createWorld();
    draw();
});

viewCanvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, viewCanvas),
        position = "("+ point.hash() + ")",
        height = currentWorld.terrainMap.heightMap.grid.get(point),
        heightText = " | Height: " + height,
        heat = currentWorld.heatMap.grid.get(point),
        heatText = " | Temp.: " + currentWorld.heatMap.idMap[heat].name,
        rain = currentWorld.rainMap.heightMap.grid.get(point),
        rainText = " | Pluviosity: " + currentWorld.rainMap.idMap[rain].name,
        terrain = " | Terrain: " + currentWorld.terrainMap.idMap[height].name;

    infoText.innerHTML = position + heightText + terrain + heatText + rainText;
});

viewCanvas.addEventListener('mouseout', function(e) {
    infoText.innerHTML = infoText.title;
});

generateButton.click();
