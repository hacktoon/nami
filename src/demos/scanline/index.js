import _ from 'lodash'
import {Grid, ScanlineFill} from '../../lib/grid'


const viewCanvas = document.getElementById("grid")
const TILESIZE = 3,
    SIZE = 180

const draw = (grid) => {
    let ctx = viewCanvas.getContext('2d')

    viewCanvas.width = viewCanvas.height = SIZE * TILESIZE
    grid.forEach((value, point) => {
        drawPoint(ctx, point, value == 1 ? "red" : "white")
    })
}

const drawPoint = (ctx, point, color) => {
    let x = point.x * TILESIZE,
        y = point.y * TILESIZE

    ctx.fillStyle = color
    ctx.fillRect(x, y, TILESIZE, TILESIZE)
}

const init = () => {
    let grid = new Grid(SIZE, SIZE, 0)
    draw(grid)
}

init()