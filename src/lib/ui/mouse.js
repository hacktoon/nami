import React, { useState } from 'react'


export function MouseView(props) {
    const [dragPoint, setDragPoint] = useState(new Point(0, 0))
    const [dragging, setDragging]   = useState(false)
    const [offset, setOffset]       = useState(new Point(0, 0))

    const onMouseDown = event => {
        event.preventDefault()
        setDragging(true)
        setDragPoint(getMousePoint(event))
    }

    const onMouseMove = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        props.onDrag(calcOffset(mousePoint))
    }

    const onMouseUp = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        setDragging(false)
        setOffset(calcOffset(mousePoint))
    }

    const calcOffset = point => dragPoint.minus(point).plus(offset)

    return (
        <div className="MouseView"
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