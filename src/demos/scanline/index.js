import _ from 'lodash'
import {Grid, ScanlineFill} from '../../lib/grid'
import {Point} from '../../lib/point'


const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const wallModeCheckbox = document.getElementById("wallMode")
const TILESIZE = 20
const SIZE = 30

const colorMap = {
    0: "white",
    1: "lightblue",
    2: "black"
}

let grid

const draw = (grid) => {
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
    grid = new Grid(SIZE, SIZE, 0)
    draw(grid)
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
    if (wallModeCheckbox.checked) {
        grid.set(point, 2)
        draw(grid)
    }
})

init()
