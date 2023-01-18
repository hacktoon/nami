import { React, useRef, useLayoutEffect } from 'react'


export function Canvas({viewport, onInit, className='Canvas'}) {
    const ref = useRef(null)

    useLayoutEffect(() => onInit(new CanvasContext(ref.current)))

    return <canvas ref={ref}
        className={className}
        width={viewport.width}
        height={viewport.height}>
    </canvas>
}


class CanvasContext {
    constructor(canvas) {
        this.context = canvas.getContext('2d')
        this.width = canvas.width
        this.height = canvas.height
    }

    rect(point, size, color) {
        const [x, y] = point
        this.context.fillStyle = color
        this.context.fillRect(x, y, size, size)
    }

    outline(point, size, color='#00F') {
        const [x, y] = point
        const lineSize = Math.ceil(size / 10)
        this.context.strokeStyle = color
        this.context.lineWidth = lineSize
        const offsetSize = size - lineSize * 2
        this.context.strokeRect(x+lineSize, y+lineSize, offsetSize, offsetSize)
    }

    text(point, size, text, color='#000') {
        const offset = Math.floor(size / 2)
        this.context.fillStyle = color
        this.context.textAlign = "center"
        this.context.font = "25px monospace"
        this.context.fillText(text, point[0] + offset, point[1] + offset)
    }

    reset() {
        this.context.clearRect(0, 0, this.width, this.height)
    }

    clear(size, point) {
        const [x, y] = point
        this.context.clearRect(x, y, size, size)
    }

    cursor(size, point) {
        const [x, y] = point
        this.context.fillStyle = '#FFF'
        this.context.fillRect(x, y, size, size)
    }
}


export function createCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return new CanvasContext(canvas)
}
