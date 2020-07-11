import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseView } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function MapView({image}) {
    const [focus, setFocus] = useState(new Point(0, 0))
    const [offset, setOffset] = useState(new Point(0, 0))
    const onDrag = offset => setOffset(new Point(offset.x, offset.y))

    const renderForeground = (i, j, canvas) => {
        const _offset = calcGridOffset(offset, image)
        const point = new Point(_offset.x + i, _offset.y + j)
        if (isWrappable(image, point)) {
            const color = image.get(point)
            renderCell(canvas.context, i, j, color, image.tileSize)
        }
    }

    const renderBackground = (i, j, canvas) => {
        const _offset = calcGridOffset(offset, image)
        const point = new Point(_offset.x + i, _offset.y + j)
        if (!isWrappable(image, point) && (i + j) % 2) {
            renderCell(canvas.context, i, j, '#FFF', image.tileSize)
        }
    }

    const onCanvasSetup = canvas => {
        let [width, height] = getTileWindow(canvas, image)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderForeground(i, j, canvas)
            }
        }
    }

    const onBackgroundCanvasSetup = canvas => {
        let [width, height] = getTileWindow(canvas, image)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderBackground(i, j, canvas)
            }
        }
    }

    return <section className="MapView">
        <MouseView onDrag={onDrag} />
        <Canvas onInit={onCanvasSetup} />
        <div className="BackgroundCanvas">
            <Canvas onInit={onBackgroundCanvasSetup} />
        </div>
    </section>
}

function renderCell(context, i, j, color, tileSize) {
    const x = i * tileSize
    const y = j * tileSize
    context.fillStyle = color
    context.fillRect(x, y, tileSize, tileSize)
}

function isWrappable(image, point) {
    if (image.wrapMode) return true
    const col = point.x >= 0 && point.x < image.width
    const row = point.y >= 0 && point.y < image.height
    return col && row
}

function calcGridOffset(offset, image) {
    return new Point(
        Math.floor(offset.x / image.tileSize),
        Math.floor(offset.y / image.tileSize)
    )
}

function getTileWindow(canvas, image) {
    const width = Math.ceil(canvas.width / image.tileSize)
    const height = Math.ceil(canvas.height / image.tileSize)
    return [width, height]
}



export function Layer({image}) {

}

export function BGLayer({tileSize}) {

}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawImage(originalCanvas, 0, 0)
    return canvas
}
