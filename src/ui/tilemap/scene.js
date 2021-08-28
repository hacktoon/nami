import React, { useState, useRef } from 'react'

import { Point } from '/lib/base/point'
import { Canvas } from '/ui/canvas'
import { useResize } from '/ui'

import { TileMapScene } from '/lib/model/tilemap/scene'

import { UITileMapMouse } from './mouse'


export function UITileMapScene(props) {
    const viewport = useRef(null)
    const rect = useResize(viewport)

    return <section className="UITileMapScene" ref={viewport}>
        {viewport.current && <UITileMapSceneContent rect={rect} {...props} />}
    </section>
}


function UITileMapSceneContent({diagram, rect, ...props}) {
    const [prevFocus, setPrevFocus] = useState([0, 0])
    const scene = TileMapScene.create(diagram, rect, props.sceneData)

    // TODO: calc if should create a moving canvas or not
    // depends on wrap option
    // depends on canvas covering all viewport

    const handleDragStart = () => setPrevFocus(scene.focus)
    const handleDrag = point => props.handleDrag(Point.plus(prevFocus, point))
    const handleWheel = amount => props.handleWheel(scene.zoom + amount)
    const handleClick = point => props.handleClick(point)
    const handleInit = canvas => scene.render(canvas)

    return <>
        <UITileMapMouse
            scene={scene}
            onDrag={handleDrag}
            onClick={handleClick}
            onWheel={handleWheel}
            onDragStart={handleDragStart}
        />
        <Canvas rect={rect} onInit={handleInit}/>
    </>
}
