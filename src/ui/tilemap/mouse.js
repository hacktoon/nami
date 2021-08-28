import React, { useState } from 'react'

import { Point } from '/lib/base/point'
import { MouseTrack } from '/ui/mouse'
import { Canvas } from '/ui/canvas'


export function UITileMapMouse({scene, ...props}) {
    /*
     Translate mouse events in pixel points to
     point objects using the scene's frame
    */
    const [cursor, setCursor] = useState(null)
    const [focus, setFocus] = useState(new Point())

    const handleDragStart = () => props.onDragStart()

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = scene.frame.tilePoint(startPoint)
        const endTilePoint = scene.frame.tilePoint(endPoint)
        const newFocus = startTilePoint.minus(endTilePoint)
        if (Point.differs(newFocus, focus)) {
            setFocus(newFocus)
            props.onDrag(newFocus)
        }
    }

    const handleMove = mousePoint => {
        const scenePoint = scene.frame.tilePoint(mousePoint)
        const point = Point.plus(scenePoint, scene.focus)
        if (! cursor || Point.differs(cursor, point)) {
            setCursor(point)
        }
    }

    const handleClick = mousePoint => {
        const scenePoint = scene.frame.tilePoint(mousePoint)
        const point = Point.plus(scenePoint, scene.focus)
        props.onClick(point)
    }

    const handleMouseOut = () => setCursor(null)

    const handleCanvasInit = canvas => {
        if (cursor) {
            scene.renderCursor(canvas, cursor)
        }
    }

    return <>
        <MouseTrack
            onClick={handleClick}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onMove={handleMove}
            onMouseOut={handleMouseOut}
            onWheel={props.onWheel}
        />
        <CursorCanvas
            rect={scene.rect}
            onInit={handleCanvasInit}
        />
    </>
}


function CursorCanvas({rect, ...props}) {
    const handleInit = context => {
        context.reset()
        props.onInit(context)
    }

    return <Canvas className='CursorCanvas' rect={rect} onInit={handleInit} />
}