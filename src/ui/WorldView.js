import React, { useLayoutEffect, useRef } from 'react'

import { WorldPainter } from '../world/builder'


export default function WorldView(props) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)

    let worldPainter = new WorldPainter()

    useLayoutEffect(() => {
        let ctx = canvasRef.current.getContext('2d')
        canvasRef.current.width = containerRef.current.clientWidth
        canvasRef.current.height = containerRef.current.clientHeight
        worldPainter.draw(ctx, props.world, 3)
    })

    return <section id="main-view" ref={containerRef}>
        <canvas ref={canvasRef}></canvas>
    </section>
}