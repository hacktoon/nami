import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera, Frame } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, focus = new Point(0, 0)}) {
    const viewportRef = useRef(null)
    const [width, height] = useResize(viewportRef)

    function render() {
        const frame = new Frame(diagram.tileSize, width, height)
        return <MapFocusView diagram={diagram} frame={frame} baseFocus={focus} />
    }

    return <section className="MapView" ref={viewportRef}>
        {viewportRef.current && render()}
    </section>
}

// let x = new Point()
function MapFocusView({diagram, frame, baseFocus}) {
    const [cursorPoint, setCursorPoint] = useState(baseFocus)
    const [offset, setOffset] = useState(new Point())
    const [focus, setFocus] = useState(baseFocus)

    const camera = new Camera(diagram, frame)

    const handleMove = point => {
        // setCursorPoint(point)
    }

    const handleDrag = offset => {
        const newFocus = offset
        //setOffset(newFocus)
        // x = x.plus(newFocus)
        console.log('drag', offset)
    }

    const handleDragEnd = point => {
        //setOffset(newFocus)
        console.log('end', point)
    }

    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, focus)

    // TODO: add MapMouseCanvas to draw cursor
    return <>
        <MapMouseTrack
            frame={frame}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove} />
        <MapCanvas camera={camera} onInit={handleInit} />
    </>
}


function MapMouseTrack({frame, onDrag, onDragEnd, onMove}) {
    const [cursorPoint, setCursorPoint] = useState(new Point())
    const [dragOffset, setDragOffset] = useState(new Point())

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = frame.tilePoint(startPoint)
        const endTilePoint = frame.tilePoint(endPoint)
        const newOffset = startTilePoint.minus(endTilePoint)
        if (newOffset.differs(dragOffset)) {
            setDragOffset(newOffset)
            onDrag(newOffset)
        }
    }

    const handleDragEnd = (startPoint, endPoint) => {
        const startTilePoint = frame.tilePoint(startPoint)
        const endTilePoint = frame.tilePoint(endPoint)
        onDragEnd(startTilePoint.minus(endTilePoint))
    }

    const handleMove = mousePoint => {
        const point = frame.tilePoint(mousePoint)
        if (point.differs(cursorPoint)) {
            setCursorPoint(point)
            onMove(point)
        }
    }

    return <MouseTrack onDrag={handleDrag} onDragEnd={handleDragEnd} onMove={handleMove} />
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
