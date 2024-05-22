import { Color } from '/src/lib/color'
import { drawIcon } from '/src/model/tilemap/lib/draw'


export function drawBase(props) {
    const {canvas, canvasPoint, tileSize} = props
    canvas.rect(canvasPoint, tileSize, props.color)
}


export function drawHydrothermalVents(props) {
    drawIcon(props, [
        [0, 3, 0, 0, 0],
        [0, 0, 0, 3, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 2, 1, 2, 1],
        ], {
        1: Color.fromHex('#381d1d'),
        2: Color.fromHex('#ac3838'),
        3: Color.fromHex('#4c585e'),
    })
}


export function drawAtol(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 0, 0, 1],
        [0, 1, 0, 0, 1],
        [0, 0, 1, 1, 0],
        ], {
        1: Color.fromHex('#b1c79f'),
    })
}

export function drawIcebergs(props) {
    drawIcon(props, [
        [0, 1, 0, 0, 1],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0],
        ], {
        1: Color.fromHex('#eeeeee'),
    })
}

export function drawDunes(props) {
    drawIcon(props, [
        [0, 2, 2, 0, 0],
        [0, 0, 0, 2, 2],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0],
        ], {
        1: Color.fromHex('#a19759'),
        2: Color.fromHex('#afa66c'),
    })
}

export function drawSandbars(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        ], {
        1: Color.fromHex('#fcff67'),
    })
}

export function drawVolcano(props) {
    drawIcon(props, [
        [0, 0, 0, 3, 3],
        [0, 0, 3, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 1, 1, 2, 0],
        [1, 1, 1, 1, 1],
        ], {
        1: Color.fromHex('#5c5c5c'),
        2: Color.fromHex('#ac3838'),
        3: Color.fromHex('#808080'),
    })
}

export function drawReefs(props) {
    drawIcon(props, [
        [0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0],
        ], {
        1: Color.fromHex('#414141'),
    })
}