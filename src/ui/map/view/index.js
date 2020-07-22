import React, { useState } from 'react'

import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'

import { Camera } from './camera'
import { MouseTrack } from './mouse'



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
        const x = Math.round(point.x / image.tileSize)
        const y = Math.round(point.y / image.tileSize)
        setFocus(new Point(x, y))
    }
    const onInit = canvas => {
        camera.render(canvas, focus, (point, color) => {
            // TODO: move if to image tile filter
            // image is a render rules object
            // define tiles as drawable or not, or filters like translate
            // image here should be a list of tiles to render
            canvas.rect(image.tileSize, point, color)
        })
    }

    return <>
        <MouseTrack
            onClick={handleDrag}
            onDrag={handleDrag}
            tileSize={image.tileSize}
        />
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

