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

    function Layers() {
        const camera = new Camera(diagram, width, height, focus)
        return <>
            <Foreground camera={camera} setFocus={setFocus} />
            <Background camera={camera} focus={focus} />
        </>
    }

    // TODO: Add more basic layers like effects, dialogs, etc
    return <section className="MapView" ref={viewportRef}>
        {viewportRef.current && <Layers />}
    </section>
}


function Foreground({camera, setFocus}) {
    const [cursorPoint, setCursorPoint] = useState(camera.focus)

    const handleDrag = offset => {
        const newFocus = camera.focus.plus(offset)
        setFocus(newFocus)
    }

    const handleMove = point => setCursorPoint(point)

    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, cursorPoint)

    return <>
        <TileTrack camera={camera} onDrag={handleDrag} onMove={handleMove} />
        <Canvas width={camera.width} height={camera.height} onInit={handleInit} />
    </>
}


function TileTrack({camera, onDrag, onMove}) {
    const [tilePoint, setTilePoint] = useState(camera.focus)
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
        const newTilePoint = camera.tilePoint(mousePoint)
        if (newTilePoint.differs(tilePoint)) {
            setTilePoint(newTilePoint)
            onMove(newTilePoint)
        }
    }
    return <MouseTrack onDrag={handleDrag} onMove={handleMove} />
}


function Background({camera}) {
    const handleInit = canvas => camera.renderBackground(canvas)
    return <Canvas
        width={camera.width}
        height={camera.height}
        className="BackgroundCanvas"
        onInit={handleInit}
     />
}
