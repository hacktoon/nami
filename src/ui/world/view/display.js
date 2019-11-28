import React, { useState, useLayoutEffect, useRef, useCallback } from 'react'
import { Point } from '/lib/point'


export function Display(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    return <section className="view-panel">
        <Canvas painter={props.painter} offset={offset} />
        <MouseTracking onDrag={setOffset} />
    </section>
}


export function Canvas(props) {
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        props.painter(canvas.getContext('2d'), width, height, props.offset)
    })

    return <div className="canvasWrapper" ref={viewportRef}>
        <canvas ref={canvasRef}></canvas>
    </div>
}


export function MouseTracking(props) {
    const [dragPoint, setDragPoint] = useState(new Point(0, 0))
    const [dragging, setDragging] = useState(false)

    const onMouseMove = useCallback(event => {
        if (! dragging)
            return
        let mousePoint = getMousePoint(event)
        const point = dragPoint.minus(mousePoint)
        props.onDrag(point)
    })

    const onMouseDown = useCallback(event => {
        event.preventDefault()
        setDragging(true)
        setDragPoint(getMousePoint(event))
    })

    const getMousePoint = useCallback(event => {
        const {offsetX: x, offsetY: y} = event.nativeEvent
        return new Point(x, y)
    })

    return (
        <section className="tracker"
            onMouseLeave={() => setDragging(false)}
            onMouseUp={() => setDragging(false)}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}>
        </section>
    )
}