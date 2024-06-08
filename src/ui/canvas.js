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
    #ctx

    constructor(canvas) {
        this.#ctx = canvas.getContext('2d')
        this.width = canvas.width
        this.height = canvas.height
    }

    rect(point, size, color) {
        const [x, y] = point
        this.#ctx.fillStyle = color
        // add .5 to fix pixel bug
        this.#ctx.fillRect(x, y, size+.5, size+.5)
    }

    strokeRect(point, size, color) {
        const [x, y] = point
        this.#ctx.strokeStyle = color
        this.#ctx.strokeRect(x, y, size, size)
    }

    line(sourcePoint, targetPoint, size, color) {
        this.#ctx.strokeStyle = color
        this.#ctx.lineCap = "round"
        this.#ctx.lineWidth = size
        this.#ctx.beginPath()
        this.#ctx.moveTo(sourcePoint[0], sourcePoint[1])
        this.#ctx.lineTo(targetPoint[0], targetPoint[1])
        this.#ctx.stroke()
    }

    outline(point, size, color='#00F') {
        const [x, y] = point
        const lineSize = Math.ceil(size / 10)
        this.#ctx.strokeStyle = color
        this.#ctx.lineWidth = lineSize
        const offsetSize = size - lineSize * 2
        this.#ctx.strokeRect(x+lineSize, y+lineSize, offsetSize, offsetSize)
    }

    circle(point, radius, color='#00F') {
        const [x, y] = point
        this.#ctx.fillStyle = color
        this.#ctx.beginPath()
        // 0º to 360º = 0 to 2*PI
        this.#ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.#ctx.fill()
    }

    text(point, size, text, color='#000') {
        const offset = Math.floor(size / 2)
        this.#ctx.fillStyle = color
        this.#ctx.textAlign = "center"
        this.#ctx.font = `${offset}px monospace`
        this.#ctx.fillText(text, point[0] + offset, point[1] + offset)
    }

    reset() {
        this.#ctx.clearRect(0, 0, this.width, this.height)
    }

    clear(size, point) {
        const [x, y] = point
        this.#ctx.clearRect(x, y, size, size)
    }

    cursor(size, point) {
        const [x, y] = point
        const lineWidth = Math.floor(size / 15)
        const half = Math.floor(lineWidth / 2)
        const cSize = size - lineWidth
        this.#ctx.strokeStyle = '#FFF'
        this.#ctx.lineWidth = lineWidth
        this.#ctx.strokeRect(x+half, y+half, cSize, cSize)
    }
}


export function createCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return new CanvasContext(canvas)
}
