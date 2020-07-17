import React, { useState } from 'react'


export function TileMouseTrack({onDrag, tileSize}) {
    const [dragPoint, setDragPoint] = useState(new Point(0, 0))
    const [dragging, setDragging]   = useState(false)
    const [offset, setOffset]       = useState(new Point(0, 0))

    const onMouseDown = event => {
        event.preventDefault()
        setDragPoint(getMousePoint(event))
        setDragging(true)
    }

    const onMouseMove = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        onDrag(calcOffset(mousePoint))
    }

    const onMouseUp = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        setOffset(calcOffset(mousePoint))
        setDragging(false)
    }

    const calcOffset = point => dragPoint.minus(point).plus(offset)

    return (
        <div className="TileMouseTrack"
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}>
        </div>
    )
}


const getMousePoint = event => {
    const { offsetX, offsetY } = event.nativeEvent
    return new Point(offsetX, offsetY)
}