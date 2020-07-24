import React, { useState, useRef, useLayoutEffect } from 'react'


export function Canvas({onInit, className='Canvas'}) {
    const [, setSize] = useState([0, 0])
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const viewport = viewportRef.current
        const width = canvas.width = viewport.clientWidth
        const height = canvas.height = viewport.clientHeight
        const updateSize = () => setSize([width, height])

        onInit(new CanvasContext(canvas, width, height))
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    })

    return <div className={className} ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}


class CanvasContext {
    constructor(canvas, width, height) {
        this.context = canvas.getContext('2d')
        this.width = width
        this.height = height
    }

    rect(size, point, color) {
        const {x, y} = point
        this.context.fillStyle = color
        this.context.fillRect(x, y, size, size)
    }

    stroke(size, point) {
        const {x, y} = point
        this.context.strokeStyle = '#FFF'
        this.context.strokeRect(x, y, size, size)
    }
}


function createCanvas(originalCanvas) {
    const canvas = document.createElement('canvas')
    canvas.width = myCanvas.width
    canvas.height = myCanvas.height

    canvas.getContext('2d').drawDiagram(originalCanvas, 0, 0)
    return canvas
}
