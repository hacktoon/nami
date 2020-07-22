import React, { useState } from 'react'


export function MouseTrack({onDrag, tileSize}) {
    const [dragStart, setDragPoint] = useState(new Point(0, 0))
    const [dragging, setDragging]   = useState(false)
    const [offset, setOffset]       = useState(new Point(0, 0))
    const [mapOffset, setMapOffset] = useState(new Point(0, 0))

    const onMouseDown = event => {
        event.preventDefault()
        setDragPoint(getMousePoint(event))
        setDragging(true)
    }

    const onMouseMove = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        const pixelPoint = pixelOffset(mousePoint)
        const point = pixelPoint.apply(coord => Math.round(coord / tileSize))
        if (mapOffset.differs(point)) {
            setMapOffset(point)
            onDrag(point)
        }
    }

    const onMouseUp = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        setOffset(pixelOffset(mousePoint))
        setDragging(false)
    }

    const pixelOffset = mousePoint => dragStart.minus(mousePoint).plus(offset)

    return (
        <div className="MouseTrack"
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