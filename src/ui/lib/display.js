import React, { useRef, useState, useLayoutEffect } from 'react'

import { Point } from '/lib/point'


export function GridDisplay(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    return <section className="GridDisplay">
        <MouseTracker onDrag={setOffset} />
        <Canvas render={props.render} offset={offset} />
    </section>
}


export class RenderConfig {
    constructor(config={}) {
        this.canvas = config.canvas || <canvas />
        this.offset = config.offset || new Point(0, 0)
        this.viewWidth = Number(config.viewWidth)
        this.viewHeight = Number(config.viewHeight)
        this.tilesize = Number(config.tilesize)
    }

    get gridWidthSpan() {
        return Math.ceil(this.viewWidth / this.tilesize)
    }

    get gridHeightSpan() {
        return Math.ceil(this.viewHeight / this.tilesize)
    }

    getGridPoint(i, j) {
        const x = Math.floor(this.offset.x / this.tilesize)
        const y = Math.floor(this.offset.y / this.tilesize)
        return new Point(x + i, y + j)
    }
}


export function Canvas(props) {
    const render = props.render || function() {}
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        render(canvas.getContext('2d'), width, height, props.offset)
    })

    return <div className="Canvas" ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}


export function MouseTracker(props) {
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
        <div className="MouseTracker"
            onMouseLeave={() => setDragging(false)}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}>
        </div>
    )
}