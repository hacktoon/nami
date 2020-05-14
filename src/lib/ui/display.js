import React, { useRef, useState, useLayoutEffect } from 'react'

import { Point } from '/lib/point'


export function GridDisplay(props) {
    const [offset, setOffset] = useState(new Point(0, 0))
    let prevOffset = offset

    const onDrag = pixelOffset => {
        let x = Math.floor(pixelOffset.x / props.tilesize)
        let y = Math.floor(pixelOffset.y / props.tilesize)
        const offset = new Point(x, y)
        if (! offset.equals(prevOffset)) {
            prevOffset = offset
            setOffset(offset)
        }
    }

    const onRender = (canvas, width, height) => {
        const gridRender = new GridRender({
            canvas, width, height, offset, tilesize: props.tilesize
        })

        for(let i = 0; i < gridRender.gridWidthSpan; i++) {
            for(let j = 0; j < gridRender.gridHeightSpan; j++) {
                renderCell(i, j, gridRender)
            }
        }
    }

    const renderCell = (i, j, gridRender) => {
        const point = gridRender.getGridPoint(i, j)
        const x = i * gridRender.tilesize
        const y = j * gridRender.tilesize
        const nowrap = isWrapDisabled(point)
        let color = nowrap ? 'black' : props.colorAt(point)

        gridRender.drawCell(x, y, color)
        if (props.gridMode)   gridRender.drawBorders(x, y, point)
    }

    const isWrapDisabled = point => {
        const offWidth = point.x < 0 || point.x >= props.width
        const offHeight = point.y < 0 || point.y >= props.height
        return ! props.wrapMode && (offWidth || offHeight)
    }

    return <section className="GridDisplay">
        <MouseTracker onDrag={onDrag} />
        <Canvas onRender={onRender} />
    </section>
}


class GridRender {
    constructor(config={}) {
        this.canvas   = config.canvas
        this.width    = Number(config.width)
        this.height   = Number(config.height)
        this.offset   = config.offset || new Point(0, 0)
        this.tilesize = Number(config.tilesize)
    }

    drawCell(x, y, color) {
        this.canvas.fillStyle = color
        this.canvas.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawBorders(x, y, point) {
        const axisColor = '#222'
        const stroke = 3

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
        return new Point(this.offset.x + i, this.offset.y + j)
    }
}


export function Canvas(props) {
    const render = props.onRender || new Function()
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        const canvasContext = canvas.getContext('2d', {alpha: false})
        render(canvasContext, width, height)
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