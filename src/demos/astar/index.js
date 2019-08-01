import _ from 'lodash'
import { Grid } from '../../lib/grid'
import { Random } from '../../lib/base'
import { Point } from '../../lib/point'

const tilesize = 3
const viewSizeX = 257
const viewSizeY = 257


let grid

const viewCanvas = document.getElementById("grid")
const ctx = viewCanvas.getContext('2d')
const drawButton = document.getElementById("draw")


const draw = () => {
    viewCanvas.width = viewSizeX * tilesize
    viewCanvas.height = viewSizeY * tilesize

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
