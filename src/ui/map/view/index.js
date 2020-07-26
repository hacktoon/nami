import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, focus = new Point(0, 0)}) {
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

    const handleDrag = (pixelDrag, mousePoint) => {
        // setCurrentFocus(newFocus)
        camera.mouseTile(pixelDrag, mousePoint)
    }
    const handleMove = mousePoint => {
    }
    // TODO: camera.render should return <Canvas>
    const handleInit = canvas => camera.render(canvas, currentFocus)

    return <>
        <MouseTrack onDrag={handleDrag} onMove={handleMove} />
        <Canvas width={camera.width} height={camera.height} onInit={handleInit} />
    </>
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
