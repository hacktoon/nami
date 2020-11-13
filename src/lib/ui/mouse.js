import React, { useState } from 'react'

import { Point } from '/lib/point'


export function MouseTrack(props) {
    const [dragStart, setDragStart] = useState(new Point(0, 0))
    const [dragging, setDragging]   = useState(false)

    const handleClick = event => {
        props.onClick(createMousePoint(event))
    }

    const handleMouseDown = event => {
        setDragStart(createMousePoint(event))
        setDragging(true)
    }

    const handleMouseMove = event => {
        const mousePoint = createMousePoint(event)
        if (dragging) {
            props.onDrag && props.onDrag(dragStart, mousePoint)
        } else {
            props.onMove && props.onMove(mousePoint)
        }
    }

    const handleMouseUp = event => {
        const mousePoint = createMousePoint(event)
        setDragging(false)
        if (dragging && props.onDragEnd) {
            props.onDragEnd(dragStart, mousePoint)
        }
    }

    const handleMouseOut = () => {
        props.onLeave()
    }

    const handleWheel = event => {
        props.onWheel && props.onWheel(event.deltaY > 0 ? -1 : 1)
    }

    function createMousePoint(event) {
        const { offsetX, offsetY } = event.nativeEvent
        return new Point(offsetX, offsetY)
    }

    return (
        <div className="MouseTrack"
            onClick={handleClick}
            onWheel={handleWheel}
            onMouseUp={handleMouseUp}
            onMouseOut={handleMouseOut}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}>
        </div>
    )
}