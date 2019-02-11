var worldCanvas = document.getElementById("worldCanvas"),
    temperatureCanvas = document.getElementById("temperatureCanvas"),
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

var worldPainter = WorldPainter.new(worldCanvas),
    temperaturePainter = TemperaturePainter.new(temperatureCanvas);

var draw = function(world) {
    var tilesize = getTileSizeInput();
    worldPainter.draw(world.heightMap, tilesize);
    temperaturePainter.draw(world.temperatureMap, tilesize);
};

var getCanvasMousePoint = function(e, worldCanvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - worldCanvas.offsetParent.offsetLeft,
        mouseY = e.clientY - worldCanvas.offsetParent.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSizeInput()),
        y = _.parseInt(mouseY / getTileSizeInput());
    return Point.new(x, y);
};

/************ EVENT HANDLING *************************/

viewInput.addEventListener('change', function(){
    var option = getViewInput();
    if (option == "temperature") {
        temperatureCanvas.style.display = "block";
    } else {
        temperatureCanvas.style.display = "none";
    }
});

generateButton.addEventListener('click', function() {
    currentWorld = createWorld();
    draw(currentWorld);
});

worldCanvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, worldCanvas),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = currentWorld.heightMap.get(point),
        heightText = " | Height: " + height,
        terrain = " | Terrain: " + currentWorld.terrainMap[height].name;

    infoText.innerHTML = position + heightText + terrain;
});

worldCanvas.addEventListener('mouseout', function(e) {
    infoText.innerHTML = infoText.title;
});

generateButton.click();
