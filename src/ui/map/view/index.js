import React, { useState } from 'react'

import { Canvas } from '/lib/ui/canvas'
import { Camera } from './camera'
import { MouseTrack } from './mouse'


export function MapView({image, focus}) {
    // TODO: tilesize =>  camera.zoom
    const camera = new Camera(image, focus)

    // TODO: Add more basic layers like effects, dialogs, etc
    return <section className="MapView">
        <Foreground camera={camera} />
        <Background camera={camera} />
    </section>
}


function Foreground({camera}) {
    const [focus, setFocus] = useState(camera.focus)

    const handleDrag = pixelOffset => {
        // setFocus(newFocus)
    }
    const handleMove = mousePoint => {
        camera.mouseTile(mousePoint, focus)
    }
    const onInit = canvas => camera.render(canvas, focus)

    return <>
        <MouseTrack onDrag={handleDrag} onMove={handleMove} />
        <Canvas onInit={onInit} />
    </>
}


function Background({camera}) {
    const onInit = canvas => camera.renderBackground(canvas)
    return <Canvas className="BackgroundCanvas" onInit={onInit} />
}
