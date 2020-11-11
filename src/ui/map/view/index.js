import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'
import { MouseTrack } from '/lib/ui/mouse'

import { Scene } from './scene'


export function MapView({diagram, ...props}) {
    const viewportRef = useRef(null)
    const [width, height] = useResize(viewportRef)

    function render() {
        const scene = new Scene(diagram, width, height)
        return <MapSceneView scene={scene} {...props} />
    }

    return <section className="MapView" ref={viewportRef}>
        {viewportRef.current && render()}
    </section>
}


function MapSceneView({scene, ...props}) {
    const [offset, setOffset] = useState(new Point())

    const handleDrag = point => {
        setOffset(point)
        //use dragPoint here too if necessary
        //props.onDrag(scene.focus.plus(dragPoint))
    }

    const handleDragEnd = dragPoint => {
        setOffset(new Point())  // reset offset to [0,0] on drag end
        props.onDrag(scene.focus.plus(dragPoint))
    }

    const handleInit = canvas => scene.render(canvas, offset)

    // TODO: add MapMouseCanvas to draw cursor
    return <>
        <MapMouseTrack
            scene={scene}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onWheel={props.onZoom}
        />
        <Canvas
            width={scene.width}
            height={scene.height}
            onInit={handleInit}
        />
    </>
}


function MapMouseTrack({scene, ...props}) {
    /*
     Translates MouseTrack events in pixel points to
     tile objects using a view frame object
    */

    const [cursor, setCursor] = useState(new Point())
    const [dragOffset, setDragOffset] = useState(new Point())

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = scene.frame.tilePoint(startPoint)
        const endTilePoint = scene.frame.tilePoint(endPoint)
        const newOffset = startTilePoint.minus(endTilePoint)
        if (newOffset.differs(dragOffset)) {
            setDragOffset(newOffset)
            props.onDrag(newOffset)
        }
    }

    const handleDragEnd = (startPoint, endPoint) => {
        const startTilePoint = scene.frame.tilePoint(startPoint)
        const endTilePoint = scene.frame.tilePoint(endPoint)
        props.onDragEnd(startTilePoint.minus(endTilePoint))
    }

    const handleMove = mousePoint => {
        const scenePoint = scene.frame.tilePoint(mousePoint)
        const point = scenePoint.plus(scene.focus)
        if (point.differs(cursor)) {
            setCursor(point)
        }
    }

    const handleInit = canvas => scene.render(canvas, offset)

    return <>
        <MouseTrack
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
            onWheel={props.onWheel}
        />
        <Canvas
            width={scene.width}
            height={scene.height}
            onInit={handleInit}
        />
    </>
}

