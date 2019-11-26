import React, { useState, useLayoutEffect, useRef } from 'react'


const DEFAULT_TILE_SIZE = 3


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [offset, setOffset] = useState([0, 0])

    const onTilesizeChange = event => setTilesize(event.target.value)

    const onOffsetChange = (startPoint, endPoint) => {
        const x = startPoint[0] - endPoint[0]
        const y = startPoint[1] - endPoint[1]
        setOffset([x + offset[0], y + offset[1]])
    }

    const drawFunction = (ctx, width, height) => {
        console.log(offset)
        drawWorld(props.world, ctx, tilesize)
    }

    return <section id="world-view">
        <OptionsPanel
            world={props.world}
            tilesize={tilesize}
            onTilesizeChange={onTilesizeChange}
        />
        <ViewPanel
            world={props.world}
            onReady={drawFunction}
            onDrag={onOffsetChange}
        />
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
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        props.onReady(canvas.getContext('2d'), width, height)
    })

    return <section className="view-panel">
        <section className="screen" ref={viewportRef}>
            <canvas ref={canvasRef}></canvas>
        </section>
        <TrackerPanel world={props.world} onDrag={props.onDrag}/>
    </section>
}


// TRACKING PANEL ================================================

function TrackerPanel(props) {
    const [point, setPoint] = useState([0, 0])
    const [dragPoint, setDragPoint] = useState([0, 0])
    const [dragging, setDragging] = useState(false)

    const onMouseMove = event => setPoint(getEventPoint(event))
    const onMouseLeave = () => setDragging(false)

    const onMouseDown = event => {
        event.preventDefault()
        setDragging(true)
        setDragPoint(getEventPoint(event))
    }

    const onMouseUp = event => {
        if (! dragging)
            return
        const startPoint = dragPoint
        const endPoint = getEventPoint(event)
        props.onDrag(startPoint, endPoint)
        setDragging(false)
    }

    const getEventPoint = event => {
        const {offsetX: x, offsetY: y} = event.nativeEvent
        return [x, y]
    }

    return <section className="tracker"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}>
            {point[0]}, {point[1]} {dragging ? ', dragging' : ''}
    </section>
}


const drawWorld = (world, ctx, tilesize) => {
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