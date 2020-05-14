import React, { useRef, useLayoutEffect } from 'react'


export function Canvas(props) {
    const setup = props.onSetup || new Function()
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        setup({
            context: canvas.getContext('2d'),
            width,
            height
        })
    })

    return <div className="Canvas" ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}