import _ from 'lodash'

import WorldBuilder from './world/builder'
import WorldPainter from './world/painter'
import {Point} from './lib/point'
import { Random } from './lib/base';

window.log = console.log.bind(console)

const WORLDSIZE = 257

let viewCanvas = document.getElementById("viewCanvas"),
    generateButton = document.getElementById("generateButton"),
    seedInput = document.getElementById("seedInput"),
    viewInput = document.getElementById('viewInput'),
    tilesizeInput = document.getElementById("tilesizeInput"),
    roughnessInput = document.getElementById("roughnessInput"),
    infoText = document.getElementById("infoText"),
    worldPainter

const getSeedInput = () => {
    let value = String(seedInput.value)
    if (value.trim() == "")
        return _.toNumber(new Date())
    if (value.match(/\d+/))
        return _.toNumber(value)
    return value
}
const getViewInput = () => viewInput.options[viewInput.selectedIndex].value
const getTileSizeInput = () => Number(tilesizeInput.value)
const getRoughnessInput = () => Number(roughnessInput.value)

const createWorld = () => {
    Random.seed = getSeedInput()
    let tilesize = getTileSizeInput()
    let worldBuilder = new WorldBuilder(WORLDSIZE, getRoughnessInput())
    let currentWorld = worldBuilder.build()
    worldPainter = new WorldPainter(currentWorld, viewCanvas, tilesize)

    return currentWorld
}

const draw = () =>  {
    let view = getViewInput(),
        tilesize = getTileSizeInput()

    viewCanvas.width = world.size * tilesize;
    viewCanvas.height = world.size * tilesize;

    let map = {
        heat:  "drawHeat",
        moisture:  "drawMoisture",
        relief:  "drawRelief",
        waterbody:  "drawWaterbody",
        landmass:  "drawLandmass",
        biome:  "drawBiome"
    }
    worldPainter[map[view]]()
}

const getCanvasMousePoint = (e, viewCanvas) => {
    let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - viewCanvas.offsetLeft,
        mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSizeInput()),
        y = _.parseInt(mouseY / getTileSizeInput());
    return new Point(x, y);
}

const showTileInfo = tile => {
    const wrap = (title, value) => {
        return `<p class='title'>${title}</p><p class='value'>${value}</p>`
    }
    let tpl = wrap('World', world.name)
    tpl += wrap('Seed', Random.seed)
    if (!tile) {
        infoText.innerHTML = tpl
        return
    }
    const point = tile.point
    const reliefMap = world.reliefMap
    tpl += wrap('Coordinates', point.hash())
    tpl += wrap('Relief', reliefMap.getHeight(point) + ' ' + reliefMap.getName(point))
    tpl += wrap('Heat', world.heatMap.getName(point))
    tpl += wrap('Moisture', world.moistureMap.getName(point))
    if (world.waterbodyMap.get(point))
        tpl += wrap('Waterbody', world.waterbodyMap.get(point).name)
    // if (tile.landmass)
    //     tpl += wrap('Landmass', tile.landmass.name)
    // tpl += wrap('Biome', tile.biome.name)


    infoText.innerHTML = tpl
}

/************ EVENT HANDLING *************************/
let dragControl = {
    startPoint: undefined,
    endPoint: undefined,
    dragging: false,
}

viewInput.addEventListener('change', draw)

generateButton.addEventListener('click', () => {
    createWorld()
    draw()
    showTileInfo()
})

viewCanvas.addEventListener('mousedown', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    dragControl.startPoint = point
    dragControl.dragging = true
})

viewCanvas.addEventListener('mousemove', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    let tile = world.get(point)
    showTileInfo(tile)
})

viewCanvas.addEventListener('mouseout', e => {
    showTileInfo()
})

viewCanvas.addEventListener('mouseup', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    dragControl.endPoint = point
    dragControl.dragging = false
})

generateButton.click()
