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
    const seedParam = getURLParams('seed')
    let value = seedInput.value
    if (seedParam) {
        seedInput.value = value = seedParam
    }
    if (value.trim() == "")
        return _.toNumber(new Date())
    if (value.match(/\d+/))
        return _.toNumber(value)
    return value
}
const getViewInput = function() {
    const viewParam = getURLParams('view')
    let value = viewInput.options[viewInput.selectedIndex].value
    if (viewParam) {
        viewInput.value = value = viewParam
    }
    return value
}
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

const init = function() {
    const tilesize = getTileSizeInput()
    const width = WORLDSIZE * tilesize;
    const height = WORLDSIZE * tilesize;
    if (viewCanvas.width != width || viewCanvas.height != height) {
        viewCanvas.width = width
        viewCanvas.height = height
    }
}

const draw = function() {
    let view = getViewInput()
    let map = {
        heightmap:  "drawHeightMap",
        heightmap2:  "drawHeat",
        heightmap3:  "drawHeat",
        relief:  "drawRelief",
        moisture:  "drawMoisture",
        heat:  "drawHeat",
        water:  "drawWater",
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

const getURLParams = function(name) {
    let params = {}
    const query = window.location.search
    const hash = query.slice(query.indexOf('?') + 1).trim()
    if (hash.length > 0) {
        let pairs = hash.split('&')
        pairs.map(hash => {
            let [key, val] = hash.split('=')
            params[key] = decodeURIComponent(val)
        })
    }
    if (name) {
        return params[name]
    }
    return params
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
    tpl += wrap('Coordinates', point.hash())
    tpl += wrap('Height', world.reliefMap.heightMap.get(point))
    //tpl += wrap('Relief', world.reliefMap.getName(point))
    // tpl += wrap('Heat', world.heatMap.getName(point))
    // tpl += wrap('Moisture', world.moistureMap.getName(point))
    // if (world.waterMap.get(point))
    //     tpl += wrap('Water', world.waterMap.getName(point))
    // if (tile.landmass)
    //     tpl += wrap('Landmass', tile.landmass.name)
    // tpl += wrap('Biome', tile.biome.name)


    infoText.innerHTML = tpl
}

const updateUI = () => {
    init()
    createWorld()
    draw()
    showTileInfo()
}

/************ EVENT HANDLING *************************/
let dragControl = {
    startPoint: undefined,
    endPoint: undefined,
    dragging: false,
}

viewInput.addEventListener('change', draw)
tilesizeInput.addEventListener('change', updateUI)
roughnessInput.addEventListener('change', updateUI)
generateButton.addEventListener('click', updateUI)

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

init()
generateButton.click()
