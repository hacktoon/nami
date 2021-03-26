import React, { useRef, useLayoutEffect } from 'react'


export function Canvas({width, height, onInit, className='Canvas'}) {
    const ref = useRef(null)

    useLayoutEffect(() => onInit(new CanvasContext(ref.current)))

    return <canvas ref={ref}
        className={className}
        width={width}
        height={height}>
    </canvas>
}


class CanvasContext {
    constructor(canvas) {
        this.context = canvas.getContext('2d')
        this.width = canvas.width
        this.height = canvas.height
    }

    rect(size, point, color) {
        const {x, y} = point
        this.context.fillStyle = color
        this.context.fillRect(x, y, size, size)
    }

    reset() {
        this.context.clearRect(0, 0, this.width, this.height)
    }

    clear(size, point) {
        const {x, y} = point
        this.context.clearRect(x, y, size, size)
    }

    cursor(size, point) {
        const {x, y} = point
        this.context.fillStyle = '#FFF'
        this.context.fillRect(x, y, size, size)
        // const innerWidth = Math.floor((size * 10) / 100)
        // this.context.fillRect(x, y, size, innerWidth)
        // this.context.fillRect(x, y, innerWidth, size)
    }
}


function createCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return {canvas, context: canvas.getContext('2d')}
}
