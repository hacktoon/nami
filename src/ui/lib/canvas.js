import React, { useRef, useState, useLayoutEffect } from 'react'

import { Point } from '/lib/point'


export class PaintConfig {
    constructor(config={}) {
        this.canvas = config.canvas || <canvas />
        this.offset = config.offset || new Point(0, 0)
        this.width = Number(config.width)
        this.height = Number(config.height)
        this.tilesize = Number(config.tilesize)
    }

    get gridWidth() {
        return Math.ceil(this.width / this.tilesize)
    }

    get gridHeight() {
        return Math.ceil(this.height / this.tilesize)
    }

    getGridPoint(i, j) {
        const x = Math.floor(this.offset.x / this.tilesize)
        const y = Math.floor(this.offset.y / this.tilesize)
        return new Point(x + i, y + j)
    }
}


export function Canvas(props) {
    const painter = props.painter || function() {}
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        painter(canvas.getContext('2d'), width, height, props.offset)
    })

    return <div className="CanvasWrapper" ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
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