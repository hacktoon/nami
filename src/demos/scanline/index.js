import _ from 'lodash'

let viewCanvas = document.getElementById("grid")

var TILESIZE = 2,
    SIZE = 256

const draw = () => {
    viewCanvas.width = viewCanvas.height = SIZE * TILESIZE
}

const init = () => {
    draw()
}
