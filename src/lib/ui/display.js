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

    // TODO: canvas param must be an object which wraps CanvasContext
    const onCanvasSetup = canvas => {
        let totalColumns = Math.ceil(canvas.width / props.tilesize)
        let totalRows = Math.ceil(canvas.height / props.tilesize)

        for(let i = 0; i < totalColumns; i++) {
            for(let j = 0; j < totalRows; j++) {
                const point = new Point(offset.x + i, offset.y + j)
                const color = isWrappable(point) ? props.colorAt(point) : 'black'
                renderCell(canvas.context, i, j, color, props.tilesize)
            }
        }
    }

    const isWrappable = point => {
        if (props.wrapMode) return true
        const col = point.x >= 0 && point.x < props.width
        const row = point.y >= 0 && point.y < props.height
        return col && row
    }

    const renderCell = (context, i, j, color, tilesize) => {
        const x = i * tilesize
        const y = j * tilesize

        context.fillStyle = color
        context.fillRect(x, y, tilesize, tilesize)
    }

    return <section className="GridDisplay">
        {/* <GridTracker onMove={onMove} /> */}
        <MouseTracker onDrag={onDrag} />
        <Canvas onSetup={onCanvasSetup} />
    </section>
}
