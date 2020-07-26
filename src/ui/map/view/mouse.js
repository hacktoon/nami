import React, { useState } from 'react'

import { Point } from '/lib/point'


export function MouseTrack({onDrag, onMove}) {
    const [dragStart, setDragStart] = useState(new Point(0, 0))
    const [dragging, setDragging]   = useState(false)

    // const handleClick = event => onClick(getMousePoint(event))

    const handleMouseDown = event => {
        event.preventDefault()
        setDragStart(getMousePoint(event))
        setDragging(true)
    }

    const handleMouseMove = event => {
        const mousePoint = getMousePoint(event)
        if (dragging)
            onDrag(dragStart.minus(mousePoint), mousePoint)
        else
            onMove(mousePoint)
    }

    const handleMouseUp = () => {
        if (! dragging) return
        setDragging(false)
    }

    function getMousePoint(event) {
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