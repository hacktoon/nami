import _ from 'lodash'
import { Grid } from '../../lib/grid'
import { Random } from '../../lib/base'
import { Point } from '../../lib/point'

const tilesize = 3
const viewSizeX = 257
const viewSizeY = 257

const angleIncrement = 0.6
const step_size = 2

const getPoints = () => {
    let dir_scale = 1.0
    let x = 0
    let y = 100
    let angle = 0
    const points = []

    while (x < viewSizeX) {
        points.push(new Point(x, y))
        let dir_angle = dir_scale * Math.sin(angle)
        //dir_scale = _.clamp(dir_scale + Random.int(-7, 7) / 10, 0.5, 1.5)
        let dir_x = step_size * Math.cos(dir_angle)
        let dir_y = step_size * Math.sin(dir_angle)
        angle += angleIncrement + Random.int(-10, 10) / 10
        x = Math.round(x + dir_x)
        y = Math.round(y + dir_y)
    }
    return points
}

let grid

const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const drawButton = document.getElementById("draw")


const draw = () => {
    viewCanvas.width = viewSizeX * tilesize
    viewCanvas.height = viewSizeY * tilesize
    const points = getPoints()
    points.forEach((point, index) => {
        drawPoint(point, 'red')
    })
}

const drawPoint = (point, color) => {
    let x = point.x * tilesize
    let y = point.y * tilesize

    ctx.fillStyle = color
    ctx.fillRect(x, y, tilesize, tilesize)
}


const init = () => {
    draw()
}

drawButton.addEventListener('click', e => {
    draw()
})

init()
