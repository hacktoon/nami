import React, { useState, useLayoutEffect, useRef } from 'react'
import { Point } from '/lib/point'


export function ViewCanvas(props) {
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        props.onReady(canvas.getContext('2d'), width, height)
    })

    return <section className="display" ref={viewportRef}>
        <canvas ref={canvasRef}></canvas>
    </section>
}


export function TrackerPanel(props) {
    const [coordinates, setCoordinates] = useState(new Point(0, 0))
    const [offset, setOffset] = useState(new Point(0, 0))
    const [startDragPoint, setStartDragPoint] = useState(new Point(0, 0))
    const [dragging, setDragging] = useState(false)
    let timeoutId

    const onMouseMove = event => {
        let currentPoint = getEventPoint(event)
        let x = currentPoint.x + offset.x
        let y = currentPoint.y + offset.y
        let newPoint = new Point(x, y)

        if (dragging) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                const x = startDragPoint.x - currentPoint.x + offset.x
                const y = startDragPoint.y - currentPoint.y + offset.y
                newPoint = new Point(x, y)
                props.onDrag(newPoint)
            }, 60)
        }
        updateCoordinates(newPoint)
    }

    const updateCoordinates = point => {
        const gridX = Math.floor(point.x / props.tilesize)
        const gridY = Math.floor(point.y / props.tilesize)
        setCoordinates(new Point(gridX, gridY))
    }

    const onMouseUp = event => {
        const currentPoint = getEventPoint(event)
        const x = startDragPoint.x - currentPoint.x
        const y = startDragPoint.y - currentPoint.y
        setOffset(new Point(x + offset.x, y + offset.y))
        setDragging(false)
    }

    const onMouseDown = event => {
        event.preventDefault()
        setDragging(true)
        setStartDragPoint(getEventPoint(event))
    }

    const onMouseLeave = () => setDragging(false)

    return (
        <section className="tracker"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}>
            {coordinates.x}, {coordinates.y}
        </section>
    )
}


const getEventPoint = event => {
    const {offsetX: x, offsetY: y} = event.nativeEvent
    return new Point(x, y)
}