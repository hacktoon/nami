import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseTracker } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function GridView(props) {
    const [offset, setOffset] = useState(new Point(0, 0))
    const onDrag = offset => setOffset(new Point(offset.x, offset.y))

    // TODO: canvas param must be an object which wraps CanvasContext
    const onCanvasSetup = canvas => {
        let totalColumns = Math.ceil(canvas.width / props.tilesize)
        let totalRows = Math.ceil(canvas.height / props.tilesize)
        let offsetX = Math.floor(offset.x / props.tilesize)
        let offsetY = Math.floor(offset.y / props.tilesize)

        for(let i = 0; i < totalColumns; i++) {
            for(let j = 0; j < totalRows; j++) {
                const defaultColor = (i+ j) % 2 ? '#DDD' : '#FFF'
                const point = new Point(offsetX + i, offsetY + j)
                const color = isWrappable(point) ? props.colorAt(point) : defaultColor
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

    return <section className="GridView">
        {/* <GridTracker onMove={onMove} /> */}
        <MouseTracker onDrag={onDrag} />
        <Canvas onSetup={onCanvasSetup} />
    </section>
}
