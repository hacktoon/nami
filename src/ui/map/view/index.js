import React, { useState } from 'react'

import { Point } from '/lib/point'
import { GridMouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


class Camera {
    constructor(focus) {
        this.focus = focus
    }
}


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
        // const camera =  new Camera(focus, offset)
        const [width, height] = getTileWindow(canvas, image)

        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderPoint(image, new Point(i, j), canvas)
            }
        }
    }

    const renderPoint = (image, point, canvas) => {
        const gridOffset = offset.apply(xy => Math.floor(xy / image.tileSize))
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
