import React, { useState } from 'react'

import { Point } from '/lib/point'
import { TileMouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'
import { Camera } from './camera'



export function MapView({image, focus = new Point(0, 0)}) {
    // TODO: tilesize =>  camera.zoom
    const camera = new Camera(image, focus)

    return <section className="MapView">
        <Foreground image={image} camera={camera} />
        <Background image={image} camera={camera} />
    </section>
}


function Foreground({image, camera}) {
    const [focus, setFocus] = useState(camera.focus)
    const handleDrag = point => {
        setFocus(point)
    }
    const onInit = canvas => {
        camera.render(canvas, (gridPoint, point, color) => {
            // TODO: move if to image tile filter
            // define tiles as drawable or not, or filters like translate
            if (isWrappable(image, gridPoint)) {
                canvas.rect(image.tileSize, point, color)
            }
        })
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
