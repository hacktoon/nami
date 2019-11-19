import React, { useState, useRef, useLayoutEffect } from 'react'


export default function WorldView(props) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    let [width, setWidth] = useState(null)
    let [height, setHeight] = useState(null)

    useLayoutEffect(() => {
        setWidth(containerRef.current.offsetWidth)
        setHeight(containerRef.current.offsetHeight)

        if (width && height) {

        }
    }, [containerRef.current])

    return <section id="main-view" ref={containerRef}>
        <canvas ref={canvasRef} width={width} height={height}></canvas>
    </section>
}