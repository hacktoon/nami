import React, { useState, useRef, useLayoutEffect } from 'react'


export function Canvas({width, height, onInit, className='Canvas'}) {
    const ref = useRef(null)

    useLayoutEffect(() => onInit(new CanvasContext(ref.current)))

    return <canvas ref={ref}
        className={className}
        width={width}
        height={height}>
    </canvas>
}


export function CursorCanvas({width, height, onInit}) {
    const [cache, setCache] = useState()

    const handleInit = context => {
        onInit(context)
    }

    return <Canvas className='CursorCanvas'
        width={width}
        height={height}
        onInit={handleInit}
    />
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

    clear(size, point) {
        const {x, y} = point
        this.context.clearRect(x, y, size, size)
    }

    cursor(size, point) {
        const {x, y} = point
        // if (size < 10) {
        //     this.context.fillRect(x, y, size, size)
        // }
        this.context.fillStyle = '#FFF'
        this.context.fillRect(x, y, size, size)
        // const innerWidth = Math.floor((size * 10) / 100)
        // this.context.fillRect(x, y, size, innerWidth)
        // this.context.fillRect(x, y, innerWidth, size)
    }
}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawDiagram(originalCanvas, 0, 0)
    return canvas
}
