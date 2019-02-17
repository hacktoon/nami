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
    currentWorld.tectonicsMap
    return currentWorld;
};

var worldPainter = WorldPainter.new(viewCanvas),
    heatPainter = HeatPainter.new(viewCanvas),
    rainPainter = RainPainter.new(viewCanvas);

var draw = function() {
    var option = getViewInput(),
        tilesize = getTileSizeInput();

    viewCanvas.width = currentWorld.size * tilesize;
    viewCanvas.height = currentWorld.size * tilesize;

    if (option == "tectonics") {
        worldPainter.drawTectonics(currentWorld, tilesize);
    } else if (option == "heat") {
        worldPainter.drawBlackWhite(currentWorld, tilesize);
        heatPainter.draw(currentWorld.heatMap, tilesize);
    } else if (option == "rain") {
        worldPainter.drawBlackWhite(currentWorld, tilesize);
        rainPainter.draw(currentWorld.rainMap, tilesize);
    } else {
        worldPainter.draw(currentWorld, tilesize);
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

viewCanvas.addEventListener('click', function (e) {
    var point = getCanvasMousePoint(e, viewCanvas);
    currentWorld.lowerTerrain(point);
    draw();
});

viewCanvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, viewCanvas),
        waterPercentage = "Water: " + currentWorld.waterPercentage() + "%",
        tile = currentWorld.grid.get(point),
        position = " | ("+ tile.id + ")",
        terrain = " | Terrain: " + tile.terrain.name;
    var plate = " | Plate " + tile.plate.id + " Density ";
    plate += tile.plate.density + ", moving ";
    plate += Direction.getName(tile.plate.direction);
        // heat = currentWorld.heatMap.grid.get(point),
        // heatText = " | Temp.: " + currentWorld.heatMap.idMap[heat].name,
        // rain = currentWorld.rainMap.heightMap.grid.get(point),
        // rainText = " | Pluviosity: " + currentWorld.rainMap.idMap[rain].name,

    infoText.innerHTML = waterPercentage + position + terrain + plate;
    //infoText.innerHTML = position + height + terrain + heatText + rainText;
});

viewCanvas.addEventListener('mouseout', function(e) {
    infoText.innerHTML = infoText.title;
});

generateButton.click();
