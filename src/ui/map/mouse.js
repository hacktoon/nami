import React, { useState } from 'react'

import { Point } from '/lib/point'
import { MouseTrack } from '/lib/ui/mouse'
import { Canvas } from '/lib/ui/canvas'


export function MapMouseTrack({focusPoint, frame, ...props}) {
    /*
     Translates MouseTrack events in pixel points to
     tile objects using a view frame object
    */

    const [cursor, setCursor] = useState(null)
    const [focus, setFocus] = useState(new Point())

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = frame.tilePoint(startPoint)
        const endTilePoint = frame.tilePoint(endPoint)
        const newFocus = startTilePoint.minus(endTilePoint)
        if (newFocus.differs(focus)) {
            setFocus(newFocus)
            props.onDrag(newFocus)
        }
    }

    const handleDragEnd = (startPoint, endPoint) => {
        const startTilePoint = frame.tilePoint(startPoint)
        const endTilePoint = frame.tilePoint(endPoint)
        props.onDragEnd(startTilePoint.minus(endTilePoint))
    }

    const handleMove = mousePoint => {
        const scenePoint = frame.tilePoint(mousePoint)
        const point = scenePoint.plus(focusPoint)
        if (! cursor || point.differs(cursor)) {
            setCursor(point)
        }
    }

    const handleClick = mousePoint => {
        const scenePoint = frame.tilePoint(mousePoint)
        const point = scenePoint.plus(focusPoint)
        props.onClick(point)
    }

    const handleMouseOut = () => setCursor(null)

    const handleCanvasInit = canvas => {
        if (cursor) {
            props.onRenderCursor(canvas, cursor)
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
            width={frame.width}
            height={frame.height}
            onInit={handleCanvasInit}
        />
    </>
}


function CursorCanvas({width, height, onInit}) {
    const handleInit = context => {
        context.reset()
        onInit(context)
    }

    return <Canvas className='CursorCanvas'
        width={width}
        height={height}
        onInit={handleInit}
    />
}