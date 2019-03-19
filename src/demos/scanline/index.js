import _ from 'lodash'
import {Grid, ScanlineFill, FloodFill} from '../../lib/grid'
import {getChance} from '../../lib/base'
import {Point} from '../../lib/point'


const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const wallModeCheckbox = document.getElementById("wallMode")
const stepButton = document.getElementById("step")
const TILESIZE = 20
const SIZE = 30

const NULL_VALUE = 0
const FILL_VALUE = 1
const WALL_VALUE = 2

const colorMap = {
    [NULL_VALUE]: "white",
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
    grid = new Grid(SIZE, SIZE, () => getChance(5) ? WALL_VALUE : NULL_VALUE )
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
    }
    const isFillable = point => grid.get(point) == NULL_VALUE
    return new FloodFill(grid, startPoint, onFill, isFillable)
}

const createScanlineFill = startPoint => {
    const onFill = point => {
        grid.set(point, FILL_VALUE)
    }
    const isFillable = point => grid.get(point) == NULL_VALUE
    return new ScanlineFill(grid, startPoint, onFill, isFillable)
}

viewCanvas.addEventListener('click', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    if (wallModeCheckbox.checked) {
        grid.set(point, WALL_VALUE)
    } else {
        window.filler = filler = createFloodFill(point)
    }
    draw()
})

stepButton.addEventListener('click', e => {
    if (filler.isComplete) {
        console.log("Fill completed")
    } else {
        filler.stepFill()
        draw()
    }
})

init()
