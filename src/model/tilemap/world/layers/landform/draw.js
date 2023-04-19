import { Color } from '/src/lib/color'
import { drawIcon } from '/src/model/tilemap/lib/icon'


export function drawBase(props) {
    const {canvas, canvasPoint, tileSize} = props
    canvas.rect(canvasPoint, tileSize, props.color)
}


export function drawHydrothermalVents(props) {
    const template = [
        [0, 3, 0, 0, 0],
        [0, 0, 0, 3, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 2, 1, 2, 1],
    ]
    const colorMap = {
        1: Color.fromHex('#381d1d'),
        2: Color.fromHex('#ac3838'),
        3: Color.fromHex('#4c585e'),
    }
    drawIcon(props, template, colorMap)
}
