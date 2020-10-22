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


function MapFocusView({diagram, frame, baseFocus}) {
    const [cursorPoint, setCursorPoint] = useState(baseFocus)
    const [offset, setOffset] = useState(new Point())
    const [focus, setFocus] = useState(baseFocus)

    const camera = new Camera(diagram, frame, focus)

    const handleMove = point => {
        // setCursorPoint(point)
    }

    const handleDrag = point => {
        setOffset(point)
    }

    const handleDragEnd = point => {
        setOffset(new Point())
        setFocus(focus.plus(point))
    }

    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, offset)
    const handleBGInit = canvas => camera.renderBackground(canvas, offset)

    // TODO: add MapMouseCanvas to draw cursor
    return <>
        <MapMouseTrack
            frame={frame}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove} />
        <MapCanvas camera={camera} onInit={handleInit} onBGInit={handleBGInit}/>
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


function MapCanvas({camera, onInit, onBGInit}) {
    const {width, height} = camera
    return <>
        <Canvas width={width} height={height} onInit={onInit} />
        <Canvas className="BackgroundCanvas" width={width} height={height} onInit={onBGInit} />
    </>
}
