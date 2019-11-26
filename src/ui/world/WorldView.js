import React, { useState, useLayoutEffect, useRef } from 'react'


const DEFAULT_TILE_SIZE = 3


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const onTilesizeChange = event => setTilesize(event.target.value)

    const draw = (ctx, width, height) => {
        drawWorld(ctx, props.world, tilesize)
    }

    return <section id="world-view">
        <section className="options">
            <ViewOptions
                world={props.world}
                tilesize={tilesize}
                onTilesizeChange={onTilesizeChange}
            />
        </section>
        <View onInit={draw} />
    </section>
}


function ViewOptions(props) {
    return <section>
        <p className="item">Name: {props.world.name}</p>
        <p className="item">Seed: {props.world.seed}</p>
        <label className="item" id="tilesizeField" htmlFor="tilesizeInput">
            Tile size:
            <input type="number" id="tilesizeInput"
                onChange={props.onTilesizeChange} min="1" step="1" value={props.tilesize}
            />
        </label>
        <LayerInput />
    </section>
}


function View(props) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        let canvas = canvasRef.current
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
        props.onInit(canvas.getContext('2d'), canvas.width, canvas.height)
    })

    const onMouseMove = event => {
        let x = event.clientX - event.target.offsetLeft
        let y = event.clientY - event.target.offsetTop
    }

    return <section className="screen" ref={containerRef} onMouseMove={onMouseMove}>
        <canvas ref={canvasRef}></canvas>
    </section>
}


function LayerInput(props) {
    return <label className="item" htmlFor="viewInput">View
        <select id="viewInput">
            <option value="heightmap">Heightmap</option>
            <option value="relief">Relief</option>
            <option value="heat">Heat</option>
            <option value="moisture">Moisture</option>
            <option value="water">Water</option>
            <option value="biome">Biome</option>
            <option value="landmass">Landmass</option>
        </select>
    </label>
}


const drawWorld = (ctx, world, tilesize) => {
    world.iter((tile, point) => {
        const color = world.reliefMap.codeMap.getColor(point)
        drawWorldTile(ctx, point, tilesize, color)
    })
}

const drawWorldTile = (ctx, point, tilesize, color) => {
    let x = point.x * tilesize,
        y = point.y * tilesize

    ctx.fillStyle = color
    ctx.fillRect(x, y, tilesize, tilesize)
}