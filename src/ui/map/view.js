import React, { useState } from 'react'

import { Point } from '/lib/point'
import { GridMouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function MapView({image}) {
    const [focus, setFocus] = useState(new Point(0, 0))

    return <section className="MapView">
        <Layer image={image} />
        <BGLayer image={image} />
    </section>
}


function Layer({image}) {
    const [offset, setOffset] = useState(new Point(70, 70))
    const onDrag = dragOffset => {
        setOffset(dragOffset)
    }

    const onCanvasSetup = canvas => {
        let [width, height] = getTileWindow(canvas, image)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                const canvasPoint = new Point(i, j)
                renderForeground(image, offset, canvasPoint, canvas)
            }
        }
    }

    const renderForeground = (image, offset, canvasPoint, canvas) => {
        const _offset = calcGridOffset(offset, image)
        const point = _offset.plus(canvasPoint)
        if (isWrappable(image, point)) {
            const color = image.get(point)
            renderCell(canvas.context, canvasPoint, color, image.tileSize)
        }
    }

    return <>
        <GridMouseTrack onDrag={onDrag} tileSize={image.tileSize} />
        <Canvas onInit={onCanvasSetup} />
    </>
}

function calcGridOffset(offset, image) {
    return new Point(
        Math.floor(offset.x / image.tileSize),
        Math.floor(offset.y / image.tileSize)
    )
}


function BGLayer({image}) {
    const onBackgroundCanvasSetup = canvas => {
        let [width, height] = getTileWindow(canvas, image)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                const canvasPoint = new Point(i, j)
                renderBackground(image, canvasPoint, canvas)
            }
        }
    }

    const renderBackground = (image, canvasPoint, canvas) => {
        if ((canvasPoint.x + canvasPoint.y) % 2) {
            renderCell(canvas.context, canvasPoint, '#FFF', image.tileSize)
        }
    }

    return <div className="BackgroundCanvas">
        <Canvas onInit={onBackgroundCanvasSetup} />
    </div>
}


function renderCell(context, point, color, tileSize) {
    const x = point.x * tileSize
    const y = point.y * tileSize
    context.fillStyle = color
    context.fillRect(x, y, tileSize, tileSize)
}


function isWrappable(image, point) {
    if (image.wrapMode) return true
    const col = point.x >= 0 && point.x < image.width
    const row = point.y >= 0 && point.y < image.height
    return col && row
}


function getTileWindow(canvas, image) {
    const width = Math.ceil(canvas.width / image.tileSize)
    const height = Math.ceil(canvas.height / image.tileSize)
    return [width, height]
}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawImage(originalCanvas, 0, 0)
    return canvas
}
