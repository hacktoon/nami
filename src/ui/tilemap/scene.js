import { React, useState, useRef } from 'react'

import { Point } from '/src/lib/point'
import { Canvas } from '/src/ui/canvas'
import { useResize } from '/src/ui'

import { TileMapScene } from '/src/model/tilemap/lib/scene'

import { UITileMapMouse } from './mouse'


export function UITileMapScene(props) {
    const viewportRef = useRef(null)
    const viewport = useResize(viewportRef)
    const enabled = Boolean(viewportRef.current)

    return <section className="UITileMapScene" ref={viewportRef}>
        {enabled && <UITileMapSceneContent viewport={viewport} {...props} />}
    </section>
}


function UITileMapSceneContent({diagram, viewport, ...props}) {
    const scene = TileMapScene.create(diagram, viewport, props.sceneData)
    const [prevFocus, setPrevFocus] = useState([0, 0])

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
        <Canvas viewport={viewport} onInit={handleInit}/>
    </>
}
