window.log = console.log.bind(console);

let viewCanvas = document.getElementById("viewCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    roughnessInput = document.getElementById("roughnessInput"),
    viewInput = document.getElementById('viewInput'),
    infoText = document.getElementById("infoText");

let currentWorld, worldPainter

const getViewInput = () => {
    let option = viewInput.options[viewInput.selectedIndex];
    return option.value;
};

const getTileSizeInput = () => {
    return Number(tilesizeInput.value)
};

const getRoughnessInput = () => {
    return Number(roughnessInput.value)
};

const createWorld = () => {
    let tilesize = getTileSizeInput()
    currentWorld = WorldBuilder.build(257, getRoughnessInput())
    worldPainter = new WorldPainter(currentWorld, viewCanvas, tilesize)
    return currentWorld
}

const draw = () =>  {
    let option = getViewInput(),
        tilesize = getTileSizeInput()

    viewCanvas.width = currentWorld.size * tilesize;
    viewCanvas.height = currentWorld.size * tilesize;

    if (option == "tectonics") {
        worldPainter.drawTectonics()
    } else if (option == "heat") {
        worldPainter.drawBlackWhite()
        heatPainter.draw(currentWorld.heatMap, tilesize)
    } else if (option == "rain") {
        worldPainter.drawBlackWhite()
        rainPainter.draw(currentWorld.rainMap, tilesize)
    } else {
        worldPainter.draw()
    }
};

const getCanvasMousePoint = (e, viewCanvas) => {
    let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - viewCanvas.offsetLeft,
        mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSizeInput()),
        y = _.parseInt(mouseY / getTileSizeInput());
    return new Point(x, y);
};

/************ EVENT HANDLING *************************/

viewInput.addEventListener('change', draw)

generateButton.addEventListener('click', () => {
    createWorld()
    draw()
})

viewCanvas.addEventListener('click', e => {
    // let point = getCanvasMousePoint(e, viewCanvas)
    // draw()
})

viewCanvas.addEventListener('mousemove', e => {
    let point = getCanvasMousePoint(e, viewCanvas),
        tile = currentWorld.grid.get(point),
        position = "("+ tile.id + ")",
        terrain = " | Terrain: " + tile.terrain.name
        // heat = currentWorld.heatMap.grid.get(point),
        // heatText = " | Temp.: " + currentWorld.heatMap.idMap[heat].name,
        // rain = currentWorld.rainMap.heightMap.grid.get(point),
        // rainText = " | Pluviosity: " + currentWorld.rainMap.idMap[rain].name,

    infoText.innerHTML = position + terrain
    //infoText.innerHTML = position + height + terrain + heatText + rainText;
})

viewCanvas.addEventListener('mouseout', () => {
    infoText.innerHTML = infoText.title
})

generateButton.click()
