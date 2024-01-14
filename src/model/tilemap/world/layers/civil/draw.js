import { Color } from '/src/lib/color'
import { drawIcon } from '/src/ui/tilemap/draw'


export function drawCapital(props) {
    const template = [
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 2, 1, 2, 2, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [0, 1, 3, 3, 3, 3, 1, 0],
        [0, 1, 2, 2, 2, 2, 1, 0],
        [0, 1, 2, 1, 1, 2, 1, 0],
        [0, 1, 2, 1, 1, 2, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
    ]
    const colorMap = {
        1: Color.BLACK,
        2: Color.fromHex('CCC'),
        3: Color.fromHex('888'),
    }
    drawIcon(props, template, colorMap)
}


export function drawTown(props) {
    const template = [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 4, 3, 1, 0, 0],
        [0, 1, 4, 4, 3, 3, 1, 0],
        [1, 4, 4, 1, 1, 3, 3, 1],
        [1, 4, 1, 2, 2, 1, 3, 1],
        [1, 1, 2, 1, 1, 2, 1, 1],
        [0, 1, 2, 1, 1, 2, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
    ]
    const colorMap = {
        1: Color.BLACK,
        2: Color.fromHex('CCC'),
        3: Color.fromHex('fd004d'),
        4: Color.DARKRED,
    }
    drawIcon(props, template, colorMap)
}


export function drawVillage(props) {
    const template = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 4, 4, 3, 1, 0, 0],
        [1, 4, 4, 1, 3, 3, 1, 0],
        [1, 4, 1, 2, 1, 3, 1, 0],
        [1, 1, 2, 1, 2, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]
    const colorMap = {
        1: Color.BLACK,
        2: Color.fromHex('#d6b498'),
        3: Color.fromHex('#d47f47'),
        4: Color.fromHex('#b36028'),
    }
    drawIcon(props, template, colorMap)
}
