import { Color } from '/src/lib/color'
import { drawIcon } from '/src/ui/tilemap/draw'


export function drawPeak(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 2, 2, 2, 0],
        [3, 3, 3, 3, 3],
        ], {
        1: Color.fromHex('#eee'),
        2: Color.fromHex('#BBBBBB'),
        3: Color.fromHex('#888888'),
    })
}


export function drawMountain(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 2, 2, 0],
        [0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        ], {
        1: Color.fromHex('#788057'),
        2: Color.fromHex('#8b845d'),
    })
}

export function drawHill(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        ], {
        1: Color.fromHex('#77a777'),
    })
}

export function drawPlain(props) {
    drawIcon(props, [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        ], {})
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