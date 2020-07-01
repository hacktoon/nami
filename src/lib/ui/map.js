import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseView } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'
import { Form } from '/lib/ui/form'


export function MapImage({map}) {
    const [config, setConfig] = useState(map.image.schema.defaults)
    const renderMap = map.image.renderMap(config)
    const schema = map.image.schema

    return <section className="MapAppView">
        <Form schema={schema} onSubmit={setConfig} onChange={setConfig}></Form>
        <MapDisplay renderMap={renderMap} />
    </section>
}


export function MapDisplay({renderMap}) {
    const [offset, setOffset] = useState(new Point(0, 0))
    const onDrag = offset => setOffset(new Point(offset.x, offset.y))

    const getWindow = canvas => {
        let width = Math.ceil(canvas.width / renderMap.tilesize)
        let height = Math.ceil(canvas.height / renderMap.tilesize)
        return [width, height]
    }

    const renderForeground = (i, j, canvas) => {
        let [offsetX, offsetY] = gridOffset()
        const point = new Point(offsetX + i, offsetY + j)
        if (isWrappable(point)) {
            const color = renderMap.get(point)
            renderCell(canvas.context, i, j, color, renderMap.tilesize)
        }
    }

    const renderBackground = (i, j, canvas) => {
        let [offsetX, offsetY] = gridOffset()
        const point = new Point(offsetX + i, offsetY + j)
        if (isWrappable(point))
            return
        const color = (i + j) % 2 ? '#DDD' : '#FFF'
        renderCell(canvas.context, i, j, color, renderMap.tilesize)
    }

    const gridOffset = () => [
        Math.floor(offset.x / renderMap.tilesize),
        Math.floor(offset.y / renderMap.tilesize)
    ]

    const isWrappable = point => {
        if (renderMap.wrapMode) return true
        const col = point.x >= 0 && point.x < renderMap.width
        const row = point.y >= 0 && point.y < renderMap.height
        return col && row
    }

    const renderCell = (context, i, j, color, tilesize) => {
        const x = i * tilesize
        const y = j * tilesize
        context.fillStyle = color
        context.fillRect(x, y, tilesize, tilesize)
    }

    const onCanvasSetup = canvas => {
        let [width, height] = getWindow(canvas)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderForeground(i, j, canvas)
            }
        }
    }

    const onBackgroundCanvasSetup = canvas => {
        let [width, height] = getWindow(canvas)
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                renderBackground(i, j, canvas)
            }
        }
    }

    return <section className="MapDisplay">
        {/* <GridTracker onMove={onMove} /> */}
        <MouseView onDrag={onDrag} />
        <Canvas onSetup={onCanvasSetup} />
        <div className="BackgroundCanvas">
            <Canvas onSetup={onBackgroundCanvasSetup} />
        </div>
    </section>
}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawImage(originalCanvas, 0, 0)
    return canvas
}
