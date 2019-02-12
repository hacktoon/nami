var viewCanvas = document.getElementById("viewCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    roughnessInput = document.getElementById("roughnessInput"),
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

var createWorld = function(){
    return World.new(getRoughnessInput());
};

var thermalPainter = ThermalPainter.new(viewCanvas),
    moisturePainter = MoisturePainter.new(viewCanvas);
    terrainPainter = TerrainPainter.new(viewCanvas);

var draw = function() {
    var option = getViewInput(),
        tilesize = getTileSizeInput();
        terrainPainter.draw(currentWorld.terrainMap, tilesize);
    if (option == "thermal") {
        thermalPainter.draw(currentWorld.thermalMap, tilesize);
    } else if (option == "moisture") {
        moisturePainter.draw(currentWorld.moistureMap, tilesize);
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
    currentWorld = createWorld();
    draw();
});

viewCanvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, viewCanvas),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = currentWorld.terrainMap.grid.get(point),
        heightText = " | Height: " + height,
        thermal = currentWorld.thermalMap.grid.get(point),
        thermalText = " | Temp.: " + currentWorld.thermalMap.zones[thermal].name,
        moisture = currentWorld.moistureMap.grid.get(point),
        moistureText = " | Pluviosity: " + currentWorld.moistureMap.codeMap[moisture].name,
        terrain = " | Terrain: " + currentWorld.terrainMap.codeMap[height].name;

    infoText.innerHTML = position + heightText + terrain + thermalText + moistureText;
});

viewCanvas.addEventListener('mouseout', function(e) {
    infoText.innerHTML = infoText.title;
});

generateButton.click();