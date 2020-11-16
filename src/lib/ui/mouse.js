import React, { useState } from 'react'

import { Point } from '/lib/point'


export function MouseTrack(props) {
    const [dragStart, setDragStart] = useState(new Point())
    const [dragging, setDragging]   = useState(false)


    const handleMouseDown = event => {
        handleNativeEvent(event)
        const mousePoint = createMousePoint(event)
        setDragStart(mousePoint)
        if (event.button === 1) {  // middle mouse button
            setDragging(true)
        } else {
            props.onClick(mousePoint)
        }
    }

    const handleMouseUp = event => {
        handleNativeEvent(event)
        const mousePoint = createMousePoint(event)
        if (dragging && props.onDragEnd) {
            props.onDragEnd(dragStart, mousePoint)
        }
        setDragging(false)
    }

    const handleMouseOut = event => {
        handleNativeEvent(event)
        const mousePoint = createMousePoint(event)
        if (dragging && props.onDragEnd) {
            props.onDragEnd(dragStart, mousePoint)
        }
        setDragging(false)
        props.onMouseOut(mousePoint)
    }

    const handleMouseMove = event => {
        handleNativeEvent(event)
        const mousePoint = createMousePoint(event)
        if (dragging) {
            props.onDrag && props.onDrag(dragStart, mousePoint)
        } else {
            props.onMove && props.onMove(mousePoint)
        }
    }

    const handleWheel = event => {
        props.onWheel && props.onWheel(event.deltaY > 0 ? -1 : 1)
    }

    function createMousePoint(event) {
        handleNativeEvent(event)
        const {offsetX, offsetY} = event.nativeEvent
        return new Point(offsetX, offsetY)
    }

    function handleNativeEvent(event) {
        event.stopPropagation()
        event.preventDefault()
    }

    return <div className="MouseTrack"
        onWheel={handleWheel}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}>
    </div>
}