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
    }

    rect(size, point, color) {
        const {x, y} = point
        this.context.fillStyle = color
        this.context.fillRect(x, y, size, size)
    }

    rectBorder(size, point) {
        const {x, y} = point
        this.context.fillStyle = 'rgba(0, 0, 0, 0.3)'
        this.context.fillRect(x, y, size, size)
    }
}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawDiagram(originalCanvas, 0, 0)
    return canvas
}
