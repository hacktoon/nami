import React, { useRef, useState, useLayoutEffect } from 'react'

import { Point } from '/lib/point'
import { Canvas } from '/ui/lib'


export function Screen(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    return <section className="Screen">
        <Canvas painter={props.painter} offset={offset} />
        <MouseTracking onDrag={setOffset} />
    </section>
}


export function MouseTracking(props) {
    const [dragOrigin, setDragOrigin] = useState(new Point(0, 0))
    const [dragging, setDragging] = useState(false)
    const [offset, setOffset] = useState(new Point(0, 0))

    const onMouseMove = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        props.onDrag(getTotalOffset(mousePoint))
    }

    const onMouseDown = event => {
        event.preventDefault()
        setDragOrigin(getMousePoint(event))
        setDragging(true)
    }

    const onMouseUp = event => {
        const mousePoint = getMousePoint(event)
        setOffset(getTotalOffset(mousePoint))
        setDragging(false)
    }

    const getTotalOffset = point => {
        return dragOrigin.minus(point).plus(offset)
    }

    const getMousePoint = event => {
        const { offsetX: x, offsetY: y } = event.nativeEvent
        return new Point(x, y)
    }

    return (
        <div className="tracker"
            onMouseLeave={() => setDragging(false)}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}>
        </div>
    )
}