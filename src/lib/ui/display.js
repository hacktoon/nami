import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseTracker } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function GridDisplay(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    const onDrag = pixelOffset => {
        let x = Math.floor(pixelOffset.x / props.tilesize)
        let y = Math.floor(pixelOffset.y / props.tilesize)
        setOffset(new Point(x, y))
    }

    // TODO: canvas must return a wrapped context object
    const onCanvasSetup = canvas => {
        const gridRender = new GridRender({
            canvas, offset, tilesize: props.tilesize
        })

        for(let i = 0; i < gridRender.gridWidthSpan; i++) {
            for(let j = 0; j < gridRender.gridHeightSpan; j++) {
                renderCell(i, j, gridRender)
            }
        }
    }

    const renderCell = (i, j, gridRender) => {
        const point = new Point(offset.x + i, offset.y + j)
        const x = i * gridRender.tilesize
        const y = j * gridRender.tilesize
        let color = props.colorAt(point)

        gridRender.drawCell(x, y, color)
    }

    return <section className="GridDisplay">
        <MouseTracker onDrag={onDrag} />
        <Canvas onSetup={onCanvasSetup} />
    </section>
}


class GridRender {
    constructor(config={}) {
        this.context   = config.canvas.context
        this.width    = Number(config.canvas.width)
        this.height   = Number(config.canvas.height)
        this.tilesize = Number(config.tilesize)
    }

    get gridWidthSpan() {
        return Math.ceil(this.width / this.tilesize)
    }

    get gridHeightSpan() {
        return Math.ceil(this.height / this.tilesize)
    }

    drawCell(x, y, color) {
        this.context.fillStyle = color
        this.context.fillRect(x, y, this.tilesize, this.tilesize)
    }
}

