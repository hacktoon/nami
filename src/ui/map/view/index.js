import React, { useState } from 'react'

import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'

import { Camera } from './camera'
import { MouseTrack } from './mouse'



export function MapView({image, focus = new Point(0, 0)}) {
    // TODO: tilesize =>  camera.zoom
    const camera = new Camera(image, focus)

    // TODO: Add more basic layers like effects, dialogs, etc
    return <section className="MapView">
        <Foreground image={image} camera={camera} />
        <Background camera={camera} />
    </section>
}

function Foreground({image, camera}) {
    const [focus, setFocus] = useState(camera.focus)
    const handleDrag = point => setFocus(point)
    const onInit = canvas => camera.render(canvas, focus)

    return <>
        <MouseTrack
            onClick={handleDrag}
            onDrag={handleDrag}
            tileSize={image.tileSize}
        />
        <Canvas onInit={onInit} />
    </>
}


function Background({camera}) {
    const onInit = canvas => camera.renderBackground(canvas)
    return <Canvas className="BackgroundCanvas" onInit={onInit} />
}
