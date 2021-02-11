import React, { useState } from 'react'

import { Point } from '/lib/base/point'
import { MouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function MapMouseTrack({scene, ...props}) {
    /*
     Translates MouseTrack events in pixel points to
     tile objects using the scene's frame
    */
    const frame = scene.frame

    const [cursor, setCursor] = useState(null)
    const [focus, setFocus] = useState(new Point())

    const handleDragStart = () => props.onDragStart()

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = frame.tilePoint(startPoint)
        const endTilePoint = frame.tilePoint(endPoint)
        const newFocus = startTilePoint.minus(endTilePoint)
        if (newFocus.differs(focus)) {
            setFocus(newFocus)
            props.onDrag(newFocus)
        }
    }

    const handleMove = mousePoint => {
        const scenePoint = frame.tilePoint(mousePoint)
        const point = scenePoint.plus(frame.focus)
        if (! cursor || point.differs(cursor)) {
            setCursor(point)
        }
    }

    const handleClick = mousePoint => {
        const scenePoint = frame.tilePoint(mousePoint)
        const point = scenePoint.plus(frame.focus)
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
            width={frame.width}
            height={frame.height}
            onInit={handleCanvasInit}
        />
    </>
}


function CursorCanvas({width, height, ...props}) {
    const handleInit = context => {
        context.reset()
        props.onInit(context)
    }

    return <Canvas className='CursorCanvas'
        width={width}
        height={height}
        onInit={handleInit}
    />
}