import _ from 'lodash'

import WorldBuilder from './world/builder'
import WorldPainter from './world/painter'
import {Point} from './lib/point'

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
    let worldBuilder = new WorldBuilder(257, getRoughnessInput())
    currentWorld = worldBuilder.world
    worldPainter = new WorldPainter(currentWorld, viewCanvas, tilesize)
    return currentWorld
}

const draw = () =>  {
    let view = getViewInput(),
        tilesize = getTileSizeInput()

    viewCanvas.width = currentWorld.size * tilesize;
    viewCanvas.height = currentWorld.size * tilesize;

    if (view == "heat") {
        worldPainter.drawHeat()
    } else if (view == "rain") {
        worldPainter.drawRain()
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
        terrain = " | Terrain: " + tile.terrain.name,
        heat = " | " + tile.heat.name,
        rain = " | " + tile.rain.name

    infoText.innerHTML = position + terrain + heat + rain
})

viewCanvas.addEventListener('mouseout', () => {
    infoText.innerHTML = infoText.title
})

generateButton.click()
