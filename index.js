var worldCanvas = document.getElementById("worldCanvas"),
    thermalCanvas = document.getElementById("thermalCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    roughnessInput = document.getElementById("roughnessInput"),
    viewInput = document.getElementById('viewInput'),
    infoText = document.getElementById("infoText"),
    viewPanel = document.getElementById("viewPanel");

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

var worldPainter = WorldPainter.new(worldCanvas),
    thermalPainter = ThermalPainter.new(thermalCanvas);

var draw = function(world) {
    var tilesize = getTileSizeInput();
    worldPainter.draw(world.heightMap, tilesize);
    thermalPainter.draw(world.thermalMap, tilesize);
};

var getCanvasMousePoint = function(e, worldCanvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - worldCanvas.offsetLeft,
        mouseY = e.clientY - worldCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSizeInput()),
        y = _.parseInt(mouseY / getTileSizeInput());
    return Point.new(x, y);
};

/************ EVENT HANDLING *************************/

viewInput.addEventListener('change', function(){
    var option = getViewInput();
    if (option == "thermal") {
        thermalCanvas.style.display = "block";
    } else {
        thermalCanvas.style.display = "none";
    }
});

generateButton.addEventListener('click', function() {
    currentWorld = createWorld();
    viewPanel.width = worldCanvas.width;
    viewPanel.height = worldCanvas.height;
    draw(currentWorld);
});

viewPanel.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, viewPanel),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = currentWorld.heightMap.get(point),
        thermal = currentWorld.thermalMap.grid.get(point),
        heightText = " | Height: " + height,
        thermalText = " | Temp.: " + currentWorld.thermalMap.zones[thermal].name,
        terrain = " | Terrain: " + currentWorld.terrainMap[height].name;

    infoText.innerHTML = position + heightText + terrain + thermalText;
});

viewPanel.addEventListener('mouseout', function(e) {
    infoText.innerHTML = infoText.title;
});

generateButton.click();
