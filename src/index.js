window.log = console.log.bind(console);

var viewCanvas = document.getElementById("viewCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    roughnessInput = document.getElementById("roughnessInput"),
    platesInput = document.getElementById("platesInput"),
    viewInput = document.getElementById('viewInput'),
    infoText = document.getElementById("infoText");

var currentWorld;

var getViewInput = () => {
    var option = viewInput.options[viewInput.selectedIndex];
    return option.value;
};

var getTileSizeInput = () => {
    return Number(tilesizeInput.value)
};

var getRoughnessInput = () => {
    return Number(roughnessInput.value)
};

var getPlatesInput = () => {
    return Number(platesInput.value)
};

var createWorld = () => {
    currentWorld = WorldBuilder.build(257, getRoughnessInput(), getPlatesInput());
    return currentWorld;
};

var worldPainter = WorldPainter.new(viewCanvas),
    heatPainter = HeatPainter.new(viewCanvas),
    rainPainter = RainPainter.new(viewCanvas);

var draw = () =>  {
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

var getCanvasMousePoint = (e, viewCanvas) => {
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - viewCanvas.offsetLeft,
        mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSizeInput()),
        y = _.parseInt(mouseY / getTileSizeInput());
    return new Point(x, y);
};

/************ EVENT HANDLING *************************/

viewInput.addEventListener('change', draw);

generateButton.addEventListener('click', () => {
    createWorld();
    draw();
});

viewCanvas.addEventListener('click', (e) => {
    var point = getCanvasMousePoint(e, viewCanvas);
    currentWorld.lowerTerrain(point);
    draw();
});

viewCanvas.addEventListener('mousemove', (e) => {
    var point = getCanvasMousePoint(e, viewCanvas),
        tile = currentWorld.grid.get(point),
        position = " | ("+ tile.id + ")",
        terrain = " | Terrain: " + tile.terrain.name;
    var plate = " | Plate: <b>" + tile.plate.name + "</b>, Density = ";
    plate += tile.plate.density + ", moving ";
    plate += Direction.getName(tile.plate.direction);
        // heat = currentWorld.heatMap.grid.get(point),
        // heatText = " | Temp.: " + currentWorld.heatMap.idMap[heat].name,
        // rain = currentWorld.rainMap.heightMap.grid.get(point),
        // rainText = " | Pluviosity: " + currentWorld.rainMap.idMap[rain].name,

    infoText.innerHTML = position + terrain + plate;
    //infoText.innerHTML = position + height + terrain + heatText + rainText;
});

viewCanvas.addEventListener('mouseout', () => {
    infoText.innerHTML = infoText.title;
});

generateButton.click();
