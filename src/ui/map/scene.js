import React, { useState, useRef } from 'react'

import { Point } from '/lib/base/point'
import { Canvas } from '/ui/canvas'
import { useResize } from '/ui'

import { MapScene } from '/model/lib/map/scene'

import { UIMapMouse } from './mouse'


export function UIMapScene(props) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)
    const [prevFocus, setPrevFocus] = useState(new Point())
    const scene = MapScene.create(props.diagram, width, height, props.sceneData)

    const handleDragStart = () => setPrevFocus(scene.focus)
    const handleDrag = point => props.handleDrag(prevFocus.plus(point))
    const handleWheel = amount => props.handleWheel(scene.zoom + amount)
    const handleClick = point => props.handleClick(point)

    return <section className="UIMapScene" ref={viewport}>
        {viewport.current && <>
            <UIMapMouse
                scene={scene}
                onDrag={handleDrag}
                onClick={handleClick}
                onWheel={handleWheel}
                onDragStart={handleDragStart}
            />
            <MapCanvas scene={scene} />
        </>}
    </section>
}


function MapCanvas({scene}) {
    const handleInit = canvas => scene.render(canvas)
    return <Canvas width={scene.width} height={scene.height} onInit={handleInit}/>
}

