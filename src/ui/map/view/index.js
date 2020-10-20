import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, focus = new Point(4, 0)}) {
    // TODO: tilesize =>  camera.zoom
    const viewportRef = useRef(null)
    const [width, height] = useResize(viewportRef)

    function Layers() {
        const camera = new Camera(diagram, width, height)
        return <>
            <Foreground camera={camera} focus={focus} />
            <Background camera={camera} focus={focus} />
        </>
    }

    // TODO: Add more basic layers like effects, dialogs, etc
    return <section className="MapView" ref={viewportRef}>
        {viewportRef.current && <Layers />}
    </section>
}


function Foreground({camera, focus}) {
    const [currentFocus, setCurrentFocus] = useState(focus)
    const [cursorPoint, setCursorPoint] = useState(focus)

    const handleDrag = (startPoint, endPoint, offset) => {
        // const startTilePoint = camera.tilePoint(currentFocus, startPoint)
        // const endTilePoint = camera.tilePoint(currentFocus, endPoint)
        // const dragPoint = camera.dragPoint(currentFocus, offset)
        // console.log(dragPoint)

        // setCurrentFocus(dragPoint)
    }

    const handleMove = point => {
        setCursorPoint(point)
    }
    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, currentFocus, cursorPoint)

    return <>
        <TileTrack camera={camera} focus={focus} onDrag={handleDrag} onMove={handleMove} />
        <Canvas width={camera.width} height={camera.height} onInit={handleInit} />
    </>
}

function TileTrack({camera, focus, onDrag, onMove}) {
    const [tilePoint, setTilePoint] = useState(focus)
    const [dragOffset, setDragOffset] = useState(new Point())

    const handleDrag = (startPoint, endPoint, offset) => {
        const startTilePoint = camera.tilePoint(focus, startPoint)
        const endTilePoint = camera.tilePoint(focus, endPoint)
        const newOffset = startTilePoint.minus(endTilePoint)
        if (newOffset.differs(dragOffset)) {
            console.log(newOffset)
            setDragOffset(newOffset)
        }
    }

    const handleMove = mousePoint => {
        const newTilePoint = camera.tilePoint(focus, mousePoint)
        if (newTilePoint.differs(tilePoint)) {
            setTilePoint(newTilePoint)
            onMove(newTilePoint)
        }
    }
    return <MouseTrack onDrag={handleDrag} onMove={handleMove} />
}


function Background({camera, focus}) {
    const handleInit = canvas => camera.renderBackground(canvas, focus)
    return <Canvas
        width={camera.width}
        height={camera.height}
        className="BackgroundCanvas"
        onInit={handleInit}
     />
}
