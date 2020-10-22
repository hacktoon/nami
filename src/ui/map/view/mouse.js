import React, { useState } from 'react'

import { Point } from '/lib/point'


export function MouseTrack({onMove, onDrag, onDragEnd}) {
    const [dragStart, setDragStart] = useState(new Point(0, 0))
    const [dragging, setDragging]   = useState(false)

    // const handleClick = event => onClick(createMousePoint(event))

    const handleMouseDown = event => {
        event.preventDefault()
        setDragStart(createMousePoint(event))
        setDragging(true)
    }

    const handleMouseMove = event => {
        const mousePoint = createMousePoint(event)
        if (dragging) {
            onDrag(dragStart, mousePoint)
        } else {
            onMove(mousePoint)
        }
    }

    const handleMouseUp = event => {
        if (! dragging) return
        const mousePoint = createMousePoint(event)
        setDragging(false)
        onDragEnd(dragStart, mousePoint)
    }

    function createMousePoint(event) {
        const { offsetX, offsetY } = event.nativeEvent
        return new Point(offsetX, offsetY)
    }

    return (
        <div className="MouseTrack"
            // onClick={handleClick}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}>
        </div>
    )
}