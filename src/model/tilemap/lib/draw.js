import { Point } from '/src/lib/geometry/point'


export function drawIcon(props, template, colorMap) {
    const {canvas, canvasPoint, tileSize} = props
    const pixelSize = Math.floor(tileSize / template.length)
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
