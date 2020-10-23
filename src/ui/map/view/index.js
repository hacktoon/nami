import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera, Frame } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, focus = new Point(0, 0), onZoom}) {
    const viewportRef = useRef(null)
    const [width, height] = useResize(viewportRef)

    function render() {
        const frame = new Frame(diagram.tileSize, width, height)
        return <MapViewFrame
            diagram={diagram}
            frame={frame}
            baseFocus={focus}
            onZoom={onZoom}
        />
    }

    return <section className="MapView" ref={viewportRef}>
        {viewportRef.current && render()}
    </section>
}


function MapViewFrame({diagram, frame, baseFocus, onZoom}) {
    const [offset, setOffset] = useState(new Point())
    const [cursor, setCursor] = useState(baseFocus)
    const [focus, setFocus] = useState(baseFocus)

    const camera = new Camera(diagram, frame, focus)

    const handleMove = point => {
        // setCursor(point)
    }

    const handleDrag = point => setOffset(point)

    const handleDragEnd = point => {
        setOffset(new Point())
        setFocus(focus.plus(point))
    }

    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, offset)
    const handleBGInit = canvas => camera.renderBackground(canvas)

    // TODO: add MapMouseCanvas to draw cursor
    return <>
        <MapMouseTrack
            frame={frame}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
            onWheel={onZoom}
        />
        <MapCanvas camera={camera} onInit={handleInit} onBGInit={handleBGInit}/>
    </>
}


function MapMouseTrack({frame, onDrag, onDragEnd, onMove, onWheel}) {
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


function MapCanvas({camera, onInit, onBGInit}) {
    const {width, height} = camera
    return <>
        <Canvas width={width} height={height} onInit={onInit} />
        <Canvas className="BackgroundCanvas" width={width} height={height} onInit={onBGInit} />
    </>
}
