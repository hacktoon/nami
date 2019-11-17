import React, { useState, useRef, useEffect } from 'react'


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
    let [width, setWidth] = useState(500)
    let [height, setHeight] = useState(400)

    const containerRef = useRef(null)

    useEffect(() => {
        setWidth(containerRef.current.clientWidth)
        setHeight(containerRef.current.clientHeight)
    }, [])

    return <section id="main-view" ref={containerRef}>
        <canvas id="viewCanvas" width={width} height={height}></canvas>
    </section>
}