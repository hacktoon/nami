import React, { useState } from 'react'

import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { Camera } from './camera'
import { MouseTrack } from './mouse'


export function MapView({diagram, focus = new Point(0, 0)}) {
    // TODO: tilesize =>  camera.zoom
    const camera = new Camera(diagram)

    // TODO: Add more basic layers like effects, dialogs, etc
    return <section className="MapView">
        <Foreground camera={camera} focus={focus} />
        <Background camera={camera} focus={focus} />
    </section>
}


function Foreground({camera, focus}) {
    const [offsetFocus, setOffsetFocus] = useState(focus)

    const handleDrag = pixelOffset => {
        // setFocus(newFocus)
    }
    const handleMove = mousePoint => {
        camera.mouseTile(mousePoint, offsetFocus)
    }
    const onInit = canvas => camera.render(canvas, offsetFocus)

    return <>
        <MouseTrack onDrag={handleDrag} onMove={handleMove} />
        <Canvas onInit={onInit} />
    </>
}


function Background({camera, focus}) {
    const onInit = canvas => camera.renderBackground(canvas, focus)
    return <Canvas className="BackgroundCanvas" onInit={onInit} />
}
