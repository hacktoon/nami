import React, { useRef, useLayoutEffect } from 'react'


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