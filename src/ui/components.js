import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import WorldPainter from '../world/painter'


export function SeedInput(props) {
    return <section className="header-menu-item">
        <label htmlFor="seedInput">Seed</label>
        <input id="seedInput" type="text" onChange={props.onChange} />
    </section>
}


export function GenerateButton(props) {
    return <section className="header-menu-item">
        <button id="generateButton" onClick={props.onClick}>Generate</button>
    </section>
}

export function WorldView(props) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    let [width, setWidth] = useState(100)
    let [height, setHeight] = useState(100)

    let world = props.world

    useLayoutEffect(() => {
        setWidth(containerRef.current.clientWidth)
        setHeight(containerRef.current.clientHeight)
    }, [])

    useEffect(() => {
        console.log(width, height)
    }, [canvasRef.current])

    return <section id="main-view" ref={containerRef}>
        <canvas ref={canvasRef} width={width} height={height}></canvas>
    </section>
}