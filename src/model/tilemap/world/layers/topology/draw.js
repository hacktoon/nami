import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { drawIcon } from '/src/ui/tilemap/draw'


export function drawCity(props) {
    const template = [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 2, 2, 2, 0],
        [0, 2, 3, 2, 0],
    ]
    const colorMap = {
        1: Color.DARKRED,
        2: Color.LIGHTGRAY,
        3: Color.BLACK,
    }
    drawIcon(props, template, colorMap)
}


export function drawCapital(props) {
    const template = [
        [1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 2, 1, 2, 1],
        [1, 2, 1, 1, 1],
    ]
    const colorMap = {
        1: Color.fromHex('999'),
        2: Color.BLACK,
    }
    drawIcon(props, template, colorMap)
}