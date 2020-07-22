import React, { useState } from 'react'

import { Point } from '/lib/point'
import { TileMouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'
import { View } from './view'



export function MapView({image, focus = new Point(0, 0)}) {
    // TODO: tilesize =>  view.zoom
    const view = new View(image, focus)

    return <section className="MapView">
        <Foreground image={image} view={view} />
        <Background image={image} view={view} />
    </section>
}


function Foreground({image, view}) {
    const [focus, setFocus] = useState(view.focus)
    const handleDrag = point => {
        setFocus(point)
    }
    const onInit = canvas => {
        const tileSize = image.tileSize
        const {width, height} = canvas
        const {origin, target, offset} = view.gridRect(width, height)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                const color = image.get(gridPoint)
                if (isWrappable(image, gridPoint)) {
                    const point = new Point(x, y).minus(offset)
                    canvas.rect(image.tileSize, point, color)
                }
            }
        }
        const pixelFocus = view.pixelFocus(width, height)
        canvas.stroke(image.tileSize, pixelFocus)
    }

    return <>
        <TileMouseTrack onDrag={handleDrag} tileSize={image.tileSize} />
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
            const canvasPoint = new Point(
                gridPoint.x * image.tileSize,
                gridPoint.y * image.tileSize,
            )
            canvas.rect(image.tileSize, canvasPoint, '#FFF')
        }
    }

    return <Canvas className="BGCanvas" onInit={onInit} />
}


function getTileWindow(canvas, image) {
    return [
        Math.ceil(canvas.width / image.tileSize),
        Math.ceil(canvas.height / image.tileSize)
    ]
}


function isWrappable(image, point) {
    if (image.wrapMode) return true
    const col = point.x >= 0 && point.x < image.width
    const row = point.y >= 0 && point.y < image.height
    return col && row
}
