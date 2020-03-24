import React, { useRef, useState, useLayoutEffect } from 'react'

import { Point } from '/lib/point'


export function GridDisplay(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    const onDrag = pixelOffset => {
        //offset = Math.ceil(pixelOffset / props.tilesize)
        setOffset(pixelOffset)
    }

    const render = (canvas, width, height) => {
        const renderMap = new RenderMap({
            canvas, width, height, offset, tilesize: props.tilesize
        })
        props.render(renderMap)
    }

    return <section className="GridDisplay">
        <MouseTracker onDrag={onDrag} tilesize={props.tilesize} />
        <Canvas render={render} />
    </section>
}


export class RenderMap {
    constructor(config={}) {
        this.canvas   = config.canvas
        this.height   = Number(config.height)
        this.offset   = config.offset || new Point(0, 0)
        this.tilesize = Number(config.tilesize)
        this.width    = Number(config.width)
    }

    drawCell(x, y, color) {
        this.canvas.fillStyle = color
        this.canvas.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawText(x, y, text) {
        let dx = x + this.tilesize / 5
        let dy = y + this.tilesize / 2
        this.canvas.font = "bold 10px Arial"
        this.canvas.fillStyle = '#222'
        this.canvas.fillText(text, dx + 1, dy + 1)

        this.canvas.font = "normal 10px Arial"
        this.canvas.fillStyle = '#FFF'
        this.canvas.fillText(text, dx, dy)
    }

    drawBorders(x, y, point) {
        const axisColor = '#222'
        const stroke = 5

        this.canvas.fillStyle = '#EEE'
        this.canvas.fillRect(x, y, 1, this.tilesize)
        this.canvas.fillRect(x, y, this.tilesize, 1)

        if (point.x == 0) {
            this.canvas.fillStyle = axisColor
            this.canvas.fillRect(x, y, stroke, this.tilesize)
        }
        if (point.y == 0) {
            this.canvas.fillStyle = axisColor
            this.canvas.fillRect(x, y, this.tilesize, stroke)
        }
    }

    get gridWidthSpan() {
        return Math.ceil(this.width / this.tilesize)
    }

    get gridHeightSpan() {
        return Math.ceil(this.height / this.tilesize)
    }

    getGridPoint(i, j) {
        const x = Math.floor(this.offset.x / this.tilesize)
        const y = Math.floor(this.offset.y / this.tilesize)
        return new Point(x + i, y + j)
    }
}


export function Canvas(props) {
    const render = props.render || new Function()
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        render(canvas.getContext('2d'), width, height)
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

    const absoluteOffset = point => {
        return dragOrigin.minus(point).plus(offset)
    }

    const getMousePoint = event => {
        const { offsetX, offsetY } = event.nativeEvent
        return new Point(offsetX, offsetY)
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