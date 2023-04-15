import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'

export function drawDungeon(baseProps) {
    const template = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 2, 2, 2, 1],
        [1, 2, 2, 2, 1],
    ]
    const colorMap = {
        1: Color.BROWN,
        2: Color.BLACK,
    }
    const midSize = Math.round(baseProps.tileSize / 2)
    const midPoint = Point.plus(baseProps.canvasPoint, [midSize, 0])
    const props = {...baseProps, canvasPoint: midPoint}
    drawIcon(props, template, colorMap)
}


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


export function drawIcon(props, template, colorMap) {
    const {canvas, canvasPoint, tileSize} = props
    const pixelSize = Math.floor(tileSize / 2 / template.length)
    for (let y = 0; y < template.length; y++) {
        for (let x = 0; x < template[y].length; x++) {
            const pixel = template[y][x]
            if (pixel === 0) continue
            const color = colorMap[pixel]
            const offsetPoint = [pixelSize * x, pixelSize * y]
            const point = Point.plus(canvasPoint, offsetPoint)
            canvas.rect(point, pixelSize, color.toHex())
        }
    }
}
