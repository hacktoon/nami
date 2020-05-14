import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseTracker } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function GridDisplay(props) {
    const {colorAt, tilesize, wrapMode} = props
    const [offset, setOffset] = useState(new Point(0, 0))

    const onDrag = pixelOffset => {
        let x = Math.floor(pixelOffset.x / tilesize)
        let y = Math.floor(pixelOffset.y / tilesize)
        setOffset(new Point(x, y))
    }

    // TODO: canvas must return a wrapped context object
    const onCanvasSetup = canvas => {
        let totalColumns = Math.ceil(canvas.width / tilesize)
        let totalRows = Math.ceil(canvas.height / tilesize)

        const inRange = point => {
            if (wrapMode) return true
            // TODO: this won't work, must have grid dimensions
            const col = point.x >= 0 && point.x < totalColumns
            const row = point.y >= 0 && point.y < totalRows
            return col && row
        }

        for(let i = 0; i < totalColumns; i++) {
            for(let j = 0; j < totalRows; j++) {
                const point = new Point(offset.x + i, offset.y + j)
                const color = inRange(point) ? colorAt(point) : 'black'
                renderCell(canvas.context, i, j, color, tilesize)
            }
        }
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
