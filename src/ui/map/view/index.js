import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera, Frame } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, onZoom, onFocus}) {
    const viewportRef = useRef(null)
    const [width, height] = useResize(viewportRef)

    function render() {
        const frame = new Frame(diagram.tileSize, width, height)
        return <MapFrameView
            diagram={diagram}
            frame={frame}
            onZoom={onZoom}
            onFocus={onFocus}
        />
    }

    return <section className="MapView" ref={viewportRef}>
        {viewportRef.current && render()}
    </section>
}


function MapFrameView({diagram, frame, onZoom, onFocus}) {
    const [offset, setOffset] = useState(new Point())
    const [cursor, setCursor] = useState(diagram.focus)
    const [focus, setFocus] = useState(diagram.focus)

    const camera = new Camera(diagram, frame, diagram.focus)

    const handleMove = point => {
        // setCursor(point)
    }

    const handleDrag = point => setOffset(point)

    const handleDragEnd = dragPoint => {
        setOffset(new Point())  // reset offset to [0,0] on drag end
        const point = focus.plus(dragPoint) // add offset to current focus
        setFocus(point)
        onFocus(point)
    }

    const handleInit = canvas => camera.render(canvas, offset)

    // TODO: add MapMouseCanvas to draw cursor
    return <>
        <MapMouseTrack
            frame={frame}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
            onWheel={onZoom}
        />
        <Canvas width={camera.width} height={camera.height} onInit={handleInit} />
    </>
}


function MapMouseTrack({frame, onDrag, onDragEnd, onMove, onWheel}) {
    /*
     Translates MouseTrack events in pixel points to
     tile objects using a view frame object
    */

    const [cursor, setCursor] = useState(new Point())
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
        if (point.differs(cursor)) {
            setCursor(point)
            onMove(point)
        }
    }

    return <MouseTrack
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onMove={handleMove}
        onWheel={onWheel}
    />
}

