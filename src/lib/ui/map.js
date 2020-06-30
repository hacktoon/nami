import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseView } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawImage(originalCanvas, 0, 0)
    return canvas
}


// TODO: rename to MapCanvas or something
export function MapImage(props) {
    const [offset, setOffset] = useState(new Point(0, 0))
    const onDrag = offset => setOffset(new Point(offset.x, offset.y))

    // const renderOffscreenCanvas = canvas => {
    //     for(let i = 0; i < props.image.spec.xCount; i++) {
    //         for(let j = 0; j < props.image.spec.yCount; j++) {
    //             let [offsetX, offsetY] = gridOffset()
    //             const point = new Point(offsetX + i, offsetY + j)
    //             const color = props.image.spec.colorAt(point)
    //             renderCell(canvas.context, i, j, color, props.image.spec.tilesize)
    //         }
    //     }
    // }

    // TODO: remove reference to props.image.spec.tilesize
    const getWindow = canvas => {
        let width = Math.ceil(canvas.width / props.image.spec.tilesize)
        let height = Math.ceil(canvas.height / props.image.spec.tilesize)
        return [width, height]
    }

    const onCanvasSetup = canvas => {
        let [width, height] = getWindow(canvas)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderBackground(i, j, canvas)
                renderForeground(i, j, canvas)
            }
        }
    }

    const renderForeground = (i, j, canvas) => {
        let [offsetX, offsetY] = gridOffset()
        const point = new Point(offsetX + i, offsetY + j)
        if (isWrappable(point)) {
            const color = props.image.colorAt(point)
            renderCell(canvas.context, i, j, color, props.image.spec.tilesize)
        }
    }

    const renderBackground = (i, j, canvas) => {
        let [offsetX, offsetY] = gridOffset()
        const point = new Point(offsetX + i, offsetY + j)
        if (isWrappable(point))
            return
        const color = (i + j) % 2 ? '#DDD' : '#FFF'
        renderCell(canvas.context, i, j, color, props.image.spec.tilesize)
    }

    const gridOffset = () => [
        Math.floor(offset.x / props.image.spec.tilesize),
        Math.floor(offset.y / props.image.spec.tilesize)
    ]

    const isWrappable = point => {
        if (props.image.spec.wrapMode) return true
        const col = point.x >= 0 && point.x < props.map.width
        const row = point.y >= 0 && point.y < props.map.height
        return col && row
    }

    const renderCell = (context, i, j, color, tilesize) => {
        const x = i * tilesize
        const y = j * tilesize
        context.fillStyle = color
        context.fillRect(x, y, tilesize, tilesize)
    }

    return <section className="MapImage">
        {/* <GridTracker onMove={onMove} /> */}
        <MouseView onDrag={onDrag} />
        <Canvas onSetup={onCanvasSetup} />
        <div className="BackgroundCanvas">
            <Canvas onSetup={onCanvasSetup} />
        </div>
    </section>
}
