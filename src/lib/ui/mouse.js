import React, { useState } from 'react'


export function MouseView(props) {
    // const [mx, my] = useMousePosition
    const [dragOrigin, setDragOrigin] = useState(new Point(0, 0))
    const [dragging, setDragging] = useState(false)
    const [offset, setOffset] = useState(new Point(0, 0))

    const onMouseMove = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        props.onDrag(absoluteOffset(mousePoint))
    }

    const onMouseDown = event => {
        event.preventDefault()
        setDragOrigin(getMousePoint(event))
        setDragging(true)
    }

    const onMouseUp = event => {
        const mousePoint = getMousePoint(event)
        setOffset(absoluteOffset(mousePoint))
        setDragging(false)
    }

    const onMouseOut = () => setDragging(false)

    const absoluteOffset = point => {
        return dragOrigin.minus(point).plus(offset)
    }

    return (
        <div className="MouseView"
            onMouseLeave={() => setDragging(false)}
            onMouseUp={onMouseUp}
            onMouseOut={onMouseOut}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}>
        </div>
    )
}


const getMousePoint = event => {
    const { offsetX, offsetY } = event.nativeEvent
    return new Point(offsetX, offsetY)
}