import React, { useState, useEffect, useRef } from 'react'


const DEFAULT_TILE_SIZE = 2


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const onTilesizeChange = event => setTilesize(event.target.value)

    const draw = (ctx, width, height) => {
        drawWorld(ctx, props.world, tilesize)
    }

    return <section id="world-view">
        <section className="options">
            <p className="item">Name: {props.world.name}</p>
            <p className="item">Seed: {props.world.seed}</p>
            <label className="item" id="tilesizeField" htmlFor="tilesizeInput">
                Tile size:
                <input id="tilesizeInput"
                    onChange={onTilesizeChange}
                    type="number" min="1" step="1" value={tilesize}
                />
            </label>
            <ViewInput />
        </section>
        <Screen onInit={draw} />
    </section>
}


function Screen(props) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        let canvas = canvasRef.current
        let ctx = canvas.getContext('2d')
        canvas.width = containerRef.current.offsetWidth
        canvas.height = containerRef.current.offsetHeight
        props.onInit(ctx, canvas.width, canvas.height)
    })

    return <section className="screen" ref={containerRef}>
        <canvas ref={canvasRef}></canvas>
    </section>
}


function ViewInput(props) {
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