import React, { useState, useRef } from 'react'

import { Point } from '/lib/base/point'
import { Canvas } from '/ui/canvas'
import { useResize } from '/ui'

import { TileMapScene } from '/model/lib/tilemap/scene'

import { UITileMapMouse } from './mouse'


export function UITileMapScene(props) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)
    const [prevFocus, setPrevFocus] = useState(new Point())
    const scene = TileMapScene.create(props.diagram, width, height, props.sceneData)

    const handleDragStart = () => setPrevFocus(scene.focus)
    const handleDrag = point => props.handleDrag(prevFocus.plus(point))
    const handleWheel = amount => props.handleWheel(scene.zoom + amount)
    const handleClick = point => props.handleClick(point)

    return <section className="UITileMapScene" ref={viewport}>
        {viewport.current && <>
            <UITileMapMouse
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

