import { Color } from '/src/lib/color'
import { drawIcon } from '/src/ui/tilemap/draw'


export function drawPeak(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 2, 1, 2, 0],
        [2, 2, 2, 2, 2],
        ], {
        1: Color.fromHex('#eee'),
        2: Color.fromHex('#a1a1a1'),
    })
}


export function drawMountain(props) {
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

export function drawHill(props) {
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

export function drawPlain(props) {
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


export function drawTrench(props) {
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

export function drawAbyss(props) {
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

export function drawOcean(props) {
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

export function drawPlatform(props) {
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