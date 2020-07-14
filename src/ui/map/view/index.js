import React, { useState } from 'react'

import { Point } from '/lib/point'
import { GridMouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function MapView({image}) {
    // TODO: get focus point via image
    const [focus, setFocus] = useState(new Point(0, 0))

    return <section className="MapView">
        <Foreground image={image} focus={focus} />
        <Background image={image} focus={focus} />
    </section>
}


function Foreground({image, focus}) {
    const [offset, setOffset] = useState(new Point(0, 0))

    const onInit = canvas => {
        const [width, height] = getTileWindow(canvas, image)
        const gridOffset = new Point(
            Math.floor(offset.x / image.tileSize),
            Math.floor(offset.y / image.tileSize)
        )
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                const gridPoint = new Point(i, j)
                renderPoint(image, gridOffset, gridPoint, canvas)
            }
        }
    }

    const renderPoint = (image, gridOffset, point, canvas) => {
        // TODO: remove this plus, use focus offset point
        const gridPoint = gridOffset.plus(point)
        if (isWrappable(image, gridPoint)) {
            const color = image.get(gridPoint)
            canvas.rect(image.tileSize, point, color)
        }
    }

    return <>
        <GridMouseTrack onDrag={setOffset} tileSize={image.tileSize} />
        <Canvas onInit={onInit} />
    </>
}


function Background({image}) {
    const onInit = canvas => {
        const [width, height] = getTileWindow(canvas, image)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderPoint(image, new Point(i, j), canvas)
            }
        }
    }

    const renderPoint = (image, gridPoint, canvas) => {
        if ((gridPoint.x + gridPoint.y) % 2) {
            canvas.rect(image.tileSize, gridPoint, '#FFF')
        }
    }

    return <Canvas className="BGCanvas" onInit={onInit} />
}


function isWrappable(image, point) {
    if (image.wrapMode) return true
    const col = point.x >= 0 && point.x < image.width
    const row = point.y >= 0 && point.y < image.height
    return col && row
}


function getTileWindow(canvas, image) {
    return [
        Math.ceil(canvas.width / image.tileSize),
        Math.ceil(canvas.height / image.tileSize)
    ]
}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawImage(originalCanvas, 0, 0)
    return canvas
}
