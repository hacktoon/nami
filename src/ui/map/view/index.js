import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Canvas, CursorCanvas } from '/lib/ui/canvas'
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
    const [focusOffset, setFocusOffset] = useState(new Point())

    const handleDrag = point => {
        setFocusOffset(point)
        //use dragPoint here too if necessary
        //props.onDrag(scene.focus.plus(dragPoint))
    }

    const handleDragEnd = dragPoint => {
        setFocusOffset(new Point())  // reset offset to [0,0] on drag end
        props.onDrag(scene.focus.plus(dragPoint))
    }

    const handleInit = canvas => scene.render(canvas, focusOffset)

    return <>
        <MapMouseTrack
            scene={scene}
            focusOffset={focusOffset}
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

    const [cursor, setCursor] = useState(null)
    const [focus, setFocus] = useState(new Point())

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = scene.frame.tilePoint(startPoint)
        const endTilePoint = scene.frame.tilePoint(endPoint)
        const newFocus = startTilePoint.minus(endTilePoint)
        if (newFocus.differs(focus)) {
            setFocus(newFocus)
            props.onDrag(newFocus)
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
        if (! cursor || point.differs(cursor)) {
            setCursor(point)
        }
    }

    const handleClick = mousePoint => {
        const scenePoint = scene.frame.tilePoint(mousePoint)
        const point = scenePoint.plus(scene.focus)
    }

    const handleMouseOut = () => setCursor(null)

    const handleCanvasInit = canvas => {
        if (cursor) {
            scene.renderCursor(canvas, cursor, props.focusOffset)
        }
    }

    return <>
        <MouseTrack
            onClick={handleClick}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
            onMouseOut={handleMouseOut}
            onWheel={props.onWheel}
        />
        <CursorCanvas
            width={scene.width}
            height={scene.height}
            onInit={handleCanvasInit}
        />
    </>
}

