import React, { useState, useLayoutEffect, useRef } from 'react'


const DEFAULT_TILE_SIZE = 3


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const onTilesizeChange = event => setTilesize(event.target.value)

    const draw = (ctx, width, height) => {
        drawWorld(ctx, props.world, tilesize)
        console.info(`Rendered world '${props.world.name}'.`)
    }

    return <section id="world-view">
        <OptionsPanel
            world={props.world}
            tilesize={tilesize}
            onTilesizeChange={onTilesizeChange}
        />
        <ViewPanel world={props.world} drawFunction={draw} />
    </section>
}


function OptionsPanel(props) {
    return <section className="options-panel">
        <p className="item">Name: {props.world.name}</p>
        <p className="item">Seed: {props.world.seed}</p>
        <label className="item" id="tilesizeField" htmlFor="tilesizeInput">
            Tile size:
            <input type="number" id="tilesizeInput"
                onChange={props.onTilesizeChange}
                value={props.tilesize}
                min="1"
                step="1"
            />
        </label>
        <LayerInput />
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


// VIEW PANEL =================================================

function ViewPanel(props) {
    const screenRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = screenRef.current.clientWidth
        const height = canvas.height = screenRef.current.clientHeight
        props.drawFunction(canvas.getContext('2d'), width, height)
    })

    return <section className="view-panel">
        <section className="screen" ref={screenRef}>
            <canvas ref={canvasRef}></canvas>
        </section>
        <TrackerPanel world={props.world} />
    </section>
}

function TrackerPanel(props) {
    const [point, setPoint] = useState([0, 0])

    const onMouseMove = e => {
        const x = e.nativeEvent.offsetX
        const y = e.nativeEvent.offsetY
        setPoint([x, y])
    }

    return <section className="tracker" onMouseMove={onMouseMove}>
        {point[0]}, {point[1]}
    </section>
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