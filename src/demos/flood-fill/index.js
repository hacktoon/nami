import _ from 'lodash'
import {Grid, ScanlineFill, FloodFill} from '../../lib/grid'
import {getChance} from '../../lib/base'
import {Point} from '../../lib/point'


let grid
let filler

const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const wallModeCheckbox = document.getElementById("wallMode")
const algorithmSelect = document.getElementById("algorithm")
const tileSizeInput = document.getElementById("tileSize")
const gridSizeInput = document.getElementById("gridSize")
const infoText = document.getElementById("infoText")
const createGridButton = document.getElementById("createGrid")
const stepButton = document.getElementById("step")
const fillButton = document.getElementById("fill")

const EMPTY_VALUE = 0
const FILL_VALUE = 1
const WALL_VALUE = 2

const colorMap = {
    [EMPTY_VALUE]: "white",
    [FILL_VALUE]: "lightblue",
    [WALL_VALUE]: "black"
}

const createFloodFill = startPoint => {
    const onFill = point => {
        grid.set(point, FILL_VALUE)
        drawPoint(point, "yellow")
    }
    const isFillable = point => grid.get(point) == EMPTY_VALUE
    return new FloodFill(grid, startPoint, onFill, isFillable)
}

const createScanlineFill = startPoint => {
    const onFill = point => grid.set(point, FILL_VALUE)
    const isFillable = point => grid.get(point) == EMPTY_VALUE
    return new ScanlineFill(grid, startPoint, onFill, isFillable)
}

const getTileSize = () => Number(tileSizeInput.value) || 20
const getGridSize = () => Number(gridSizeInput.value) || 10

const draw = () => {
    viewCanvas.width = viewCanvas.height = getGridSize() * getTileSize()
    grid.forEach((value, point) => {
        let color = colorMap[value]
        drawPoint(point, color)
    })
}

const drawPoint = (point, color) => {
    let tilesize = getTileSize()
    let x = point.x * tilesize
    let y = point.y * tilesize

    ctx.fillStyle = color
    ctx.fillRect(x, y, tilesize, tilesize)
}

const createGrid = () => {
    let size = getGridSize()
    grid = new Grid(size, size, () => {
        return getChance(0.5) ? WALL_VALUE : EMPTY_VALUE
    })
}

const init = () => {
    createGrid()
    draw()
}

const getCanvasMousePoint = (e, viewCanvas) => {
    let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - viewCanvas.offsetLeft,
        mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSize()),
        y = _.parseInt(mouseY / getTileSize())
    return new Point(x, y)
}


const getFillObject = point => {
    let id = algorithmSelect.options[algorithmSelect.selectedIndex].value
    let createFill = {
        "flood": createFloodFill,
        "scanline": createScanlineFill
    }[id]

    return createFill(point)
}

viewCanvas.addEventListener('click', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    if (wallModeCheckbox.checked) {
        grid.set(point, WALL_VALUE)
        draw()
    } else {
        filler = getFillObject(point)
        draw()
        drawPoint(point, "yellow")
    }
})

viewCanvas.addEventListener('mousemove', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    infoText.innerHTML = "("+ point.hash() + ")"
})

createGridButton.addEventListener('click', init)

stepButton.addEventListener('click', e => {
    if (! filler.isComplete) {
        filler.stepFill()
        draw()
    }
})

fillButton.addEventListener('click', e => {
    let t0 = performance.now()
    filler.fill()
    let t1 = performance.now()
    console.log(t1 - t0)
    draw()
})

init()
