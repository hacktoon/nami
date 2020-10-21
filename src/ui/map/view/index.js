import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, baseFocus=new Point(4, 0)}) {
    // TODO: tilesize =>  camera.zoom
    const viewportRef = useRef(null)
    const [width, height] = useResize(viewportRef)
    const [focus, setFocus] = useState(baseFocus)
    const [cursorPoint, setCursorPoint] = useState(baseFocus)
    // const [frame,] = useState(new Frame(diagram, width, height))

    const camera = new Camera(diagram, width, height, focus)
    // const frame = new Frame(diagram.tileSize, width, height)
    // const camera = new Camera(diagram, frame, focus)

    const handleDrag = offset => {
        const newFocus = camera.focus.plus(offset)
        // setFocus(newFocus)
        console.log(newFocus);
    }

    const handleMove = point => {
        // setCursorPoint(point)
    }

    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, cursorPoint)

    // TODO: Add more basic layers like effects, dialogs, etc
    return <section className="MapView" ref={viewportRef}>
        <MapMouseTrack camera={camera} onDrag={handleDrag} onMove={handleMove} />
        {viewportRef.current && <MapCanvas camera={camera} onInit={handleInit} />}
    </section>
}


function MapMouseTrack({camera, onDrag, onMove}) {
    const [cursorPoint, setCursorPoint] = useState(new Point())
    const [dragOffset, setDragOffset] = useState(new Point())

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = camera.tilePoint(startPoint)
        const endTilePoint = camera.tilePoint(endPoint)
        const newOffset = startTilePoint.minus(endTilePoint)
        if (newOffset.differs(dragOffset)) {
            setDragOffset(newOffset)
            onDrag(newOffset)
        }
    }

    const handleMove = mousePoint => {
        const point = camera.tilePoint(mousePoint)
        if (point.differs(cursorPoint)) {
            setCursorPoint(point)
            onMove(point)
        }
    }
    return <MouseTrack onDrag={handleDrag} onMove={handleMove} />
}


function MapCanvas({camera, onInit}) {
    return <>
        <Canvas width={camera.width} height={camera.height} onInit={onInit} />
        <Canvas
            className="BackgroundCanvas"
            width={camera.width}
            height={camera.height}
            onInit={canvas => camera.renderBackground(canvas)}
        />
    </>
}
