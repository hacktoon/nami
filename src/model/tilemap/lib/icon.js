import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'


const RIVER_COLOR = '#2878a0'
const RIVER_SOUCE_COLOR = '#44F'


export function drawLake(baseProps) {
    const template = [
        [0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
    ]
    const colorMap = {1: Color.fromHex(RIVER_COLOR)}
    const midSize = Math.round(baseProps.size / 2)
    const midPoint = Point.plusScalar(baseProps.canvasPoint, midSize)
    const props = {...baseProps, canvasPoint: midPoint}
    drawIcon(props, template, colorMap)
}

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
    const midSize = Math.round(baseProps.size / 2)
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


export function drawRiver(river, {canvas, canvasPoint, size}) {
    const riverWidth = Math.floor(river.stretch.width * size)
    const midSize = Math.round(size / 2)
    const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
    const meanderOffsetPoint = buildMeanderOffsetPoint(river, size)
    const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
    for(let axisOffset of river.flowDirections) {
        // build a point for each flow that points to this point
        // create a midpoint at tile's square side
        const edgeMidPoint = [
            midCanvasPoint[0] + axisOffset[0] * midSize,
            midCanvasPoint[1] + axisOffset[1] * midSize
        ]
        canvas.line(edgeMidPoint, meanderPoint, riverWidth, RIVER_COLOR)
    }
}


export function drawRiverSource(river, {canvas, canvasPoint, size}) {
    const pixelSize = Math.round(size / 6)
    const meanderOffsetPoint = buildMeanderOffsetPoint(river, size)
    const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
    const wrappedMeanderPoint = [
        clamp(meanderPoint[0], 0, canvasPoint[0] + size - pixelSize),
        clamp(meanderPoint[1], 0, canvasPoint[1] + size - pixelSize),
    ]
    canvas.rect(wrappedMeanderPoint, pixelSize, RIVER_SOUCE_COLOR)
}


function buildMeanderOffsetPoint(river, size) {
    const percentage = river.meander
    return Point.multiplyScalar(percentage, size)
}


export function drawIcon(props, template, colorMap) {
    const {canvas, canvasPoint, size} = props
    const pixelSize = Math.floor(size / 2 / template.length)
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
