import React, { useLayoutEffect, useRef } from 'react'


export default function WorldView(props) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        let ctx = canvasRef.current.getContext('2d')
        canvasRef.current.width = containerRef.current.offsetWidth
        canvasRef.current.height = containerRef.current.offsetHeight
        props.painter.draw(ctx, props.world, 3)
    })

    return <section id="main-view" ref={containerRef}>
        <canvas ref={canvasRef}></canvas>
    </section>
}