import _ from 'lodash'
import {Grid, ScanlineFill} from '../../lib/grid'
import {getChance} from '../../lib/base'
import {Point} from '../../lib/point'


const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const wallModeCheckbox = document.getElementById("wallMode")
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
    grid = new Grid(SIZE, SIZE, () => getChance(5) ? FILL_VALUE : 0 )
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

viewCanvas.addEventListener('click', e => {
    let point = getCanvasMousePoint(e, viewCanvas)
    let value = FILL_VALUE
    if (wallModeCheckbox.checked) {
        value = WALL_VALUE
    }
    grid.set(point, value)
    draw()
})

init()
