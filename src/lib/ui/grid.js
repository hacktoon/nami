import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseTracker } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function GridView(props) {
    const [offset, setOffset] = useState(new Point(0, 0))
    const onDrag = offset => setOffset(new Point(offset.x, offset.y))

    const getWindow = canvas => {
        let x = Math.ceil(canvas.width / props.tilesize)
        let y = Math.ceil(canvas.height / props.tilesize)
        return new Point(x, y)
    }

    const onCanvasSetup = canvas => {
        let window = getWindow(canvas)
        for(let i = 0; i < window.x; i++) {
            for(let j = 0; j < window.y; j++) {
                onCanvasSetupFunction(i, j, canvas)
            }

        }
    }
    const onBackgroundCanvasSetup = canvas => {
        let window = getWindow(canvas)
        for(let i = 0; i < window.x; i++) {
            for(let j = 0; j < window.y; j++) {
                onBackgroundCanvasSetupFunction(i, j, canvas)
            }
        }
    }

    const onCanvasSetupFunction = (i, j, canvas) => {
        let [offsetX, offsetY] = gridOffset()
        const point = new Point(offsetX + i, offsetY + j)
        if (isWrappable(point)) {
            const color = props.colorAt(point)
            renderCell(canvas.context, i, j, color, props.tilesize)
        }
    }

    const onBackgroundCanvasSetupFunction = (i, j, canvas) => {
        let [offsetX, offsetY] = gridOffset()
        const point = new Point(offsetX + i, offsetY + j)
        if (isWrappable(point)) return
        const color = (i+ j) % 2 ? '#DDD' : '#FFF'
        renderCell(canvas.context, i, j, color, props.tilesize)
    }

    const gridOffset = () => [
        Math.floor(offset.x / props.tilesize),
        Math.floor(offset.y / props.tilesize)
    ]

    const buildCanvas = point => {

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
        <div className="BackgroundCanvas">
            <Canvas onSetup={onBackgroundCanvasSetup} />
        </div>
    </section>
}
