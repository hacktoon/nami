import React, { useRef, useLayoutEffect } from 'react'


export function Canvas({rect, onInit, className='Canvas'}) {
    const ref = useRef(null)

    useLayoutEffect(() => onInit(new CanvasContext(ref.current)))

    return <canvas ref={ref}
        className={className}
        width={rect.width}
        height={rect.height}>
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

    mark(point, size, color='#000') {
        const [x, y] = point
        this.context.fillStyle = color
        this.context.fillRect(x, y, size, size)
    }

    text(point, text, color='#000') {
        this.context.fillStyle = color
        this.context.textAlign = "center"
        this.context.font = "20px monospace"
        this.context.fillText(text, point[0], point[1])
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
