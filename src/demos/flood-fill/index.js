import _ from 'lodash'
import {Grid, ScanlineFill, FloodFill} from '../../lib/grid'
import {getChance} from '../../lib/base'
import {Point} from '../../lib/point'


const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const wallModeCheckbox = document.getElementById("wallMode")
const algorithmSelect = document.getElementById("algorithm")
const infoText = document.getElementById("infoText")
const stepButton = document.getElementById("step")
const fillButton = document.getElementById("fill")
const TILESIZE = 2
const SIZE = 256

const EMPTY_VALUE = 0
const FILL_VALUE = 1
const WALL_VALUE = 2

const colorMap = {
    [EMPTY_VALUE]: "white",
    [FILL_VALUE]: "lightblue",
    [WALL_VALUE]: "black"
}

let grid
let filler

const draw = () => {
    viewCanvas.width = viewCanvas.height = SIZE * TILESIZE
    grid.forEach((value, point) => {
        let color = colorMap[value]
        drawPoint(point, color)
    })
}

const drawPoint = (point, color) => {
    let x = point.x * TILESIZE,
        y = point.y * TILESIZE

    ctx.fillStyle = color
    ctx.fillRect(x, y, TILESIZE, TILESIZE)
}

const init = () => {
    grid = new Grid(SIZE, SIZE, () => getChance(15) ? WALL_VALUE : EMPTY_VALUE )
    draw()
}

const getCanvasMousePoint = (e, viewCanvas) => {
    let scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - viewCanvas.offsetLeft,
        mouseY = e.clientY - viewCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / TILESIZE),
        y = _.parseInt(mouseY / TILESIZE)
    return new Point(x, y)
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

const getAlgorithm = () => {
    return algorithmSelect.options[algorithmSelect.selectedIndex].value
}

viewCanvas.addEventListener('click', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    if (wallModeCheckbox.checked) {
        grid.set(point, WALL_VALUE)
    } else {
        if (getAlgorithm() == "flood")
            filler = createFloodFill(point)
        else
            filler = createScanlineFill(point)
    }
    draw()
})

viewCanvas.addEventListener('mousemove', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    infoText.innerHTML = "("+ point.hash() + ")"
})

stepButton.addEventListener('click', e => {
    if (filler.isComplete) {
        console.log("Fill completed")
    } else {
        filler.stepFill()
        draw()
    }
})

fillButton.addEventListener('click', e => {
    filler.fill()
    draw()
})

init()
