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
    currentWorld = World.new(257, getRoughnessInput(), getPlatesInput());
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
        terrainPainter.drawBlackWhite(currentWorld, tilesize);
        tectonicsPainter.draw(currentWorld.tectonicsMap, tilesize);
    } else if (option == "heat") {
        terrainPainter.drawBlackWhite(currentWorld, tilesize);
        heatPainter.draw(currentWorld.heatMap, tilesize);
    } else if (option == "rain") {
        terrainPainter.drawBlackWhite(currentWorld, tilesize);
        rainPainter.draw(currentWorld.rainMap, tilesize);
    } else {
        terrainPainter.draw(currentWorld, tilesize);
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
        tile = currentWorld.grid.get(point),
        position = "("+ tile.id + ")",
        terrain = " | Terrain: " + tile.terrain.name;
        // heat = currentWorld.heatMap.grid.get(point),
        // heatText = " | Temp.: " + currentWorld.heatMap.idMap[heat].name,
        // rain = currentWorld.rainMap.heightMap.grid.get(point),
        // rainText = " | Pluviosity: " + currentWorld.rainMap.idMap[rain].name,

    infoText.innerHTML = position + terrain;
    //infoText.innerHTML = position + height + terrain + heatText + rainText;
});

viewCanvas.addEventListener('mouseout', function(e) {
    infoText.innerHTML = infoText.title;
});

generateButton.click();
