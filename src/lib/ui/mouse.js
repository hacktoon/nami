import React, { useState } from 'react'

import { Point } from '/lib/point'


export function MouseTrack({onMove, onDrag, onDragEnd, onWheel}) {
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
            onDrag && onDrag(dragStart, mousePoint)
        } else {
            onMove && onMove(mousePoint)
        }
    }

    const handleMouseUp = event => {
        const mousePoint = createMousePoint(event)
        setDragging(false)
        if (dragging && onDragEnd) {
            onDragEnd(dragStart, mousePoint)
        }
    }

    const handleWheel = event => {
        onWheel && onWheel(event.deltaY > 0 ? -1 : 1)
    }

    function createMousePoint(event) {
        const { offsetX, offsetY } = event.nativeEvent
        return new Point(offsetX, offsetY)
    }

    return (
        <div className="MouseTrack"
            // onClick={handleClick}
            onWheel={handleWheel}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}>
        </div>
    )
}