import React, { useState, useLayoutEffect, useRef } from 'react'
import { Point } from '/lib/point'

const DEFAULT_TILE_SIZE = 16


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [offset, setOffset] = useState(new Point(0, 0))

    const onTilesizeChange = event => setTilesize(event.target.value)

    const drawFunction = (context, width, height) => {
        const options = { context, width, height, tilesize, offset }
        drawWorld(props.world, options)
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
            onDrag={setOffset}
            tilesize={tilesize}
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
        <TrackerPanel world={props.world} onDrag={props.onDrag} tilesize={props.tilesize} />
    </section>
}


// TRACKING PANEL ================================================

function TrackerPanel(props) {
    const [coordinates, setCoordinates] = useState(new Point(0, 0))
    const [offset, setOffset] = useState(new Point(0, 0))
    const [startDragPoint, setStartDragPoint] = useState(new Point(0, 0))
    const [dragging, setDragging] = useState(false)
    let timeoutId

    const onMouseMove = event => {
        let currentPoint = getEventPoint(event)
        let x = currentPoint.x + offset.x
        let y = currentPoint.y + offset.y
        let newPoint = new Point(x, y)

        if (dragging) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                const x = startDragPoint.x - currentPoint.x + offset.x
                const y = startDragPoint.y - currentPoint.y + offset.y
                newPoint = new Point(x, y)
                props.onDrag(newPoint)
            }, 60)
        }
        updateCoordinates(newPoint)
    }

    const updateCoordinates = point => {
        const tilesize = props.tilesize
        const gridX = Math.floor(point.x / tilesize)
        const gridY = Math.floor(point.y / tilesize)
        setCoordinates(new Point(gridX, gridY))
    }

    const onMouseUp = event => {
        const currentPoint = getEventPoint(event)
        const x = startDragPoint.x - currentPoint.x
        const y = startDragPoint.y - currentPoint.y
        setOffset(new Point(x + offset.x, y + offset.y))
        setDragging(false)
        clearTimeout(timeoutId)
    }

    const onMouseDown = event => {
        event.preventDefault()
        setDragging(true)
        setStartDragPoint(getEventPoint(event))
    }

    const onMouseLeave = () => setDragging(false)

    const getEventPoint = event => {
        const {offsetX: x, offsetY: y} = event.nativeEvent
        return new Point(x, y)
    }

    return <section className="tracker"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}>
            {coordinates.x}, {coordinates.y}
    </section>
}


const drawWorld = (world, options) => {
    const { context, width, height, tilesize, offset } = options
    const {x: offsetX, y: offsetY} = offset
    const subGridWidth = Math.ceil(width / tilesize)
    const subGridHeight = Math.ceil(height / tilesize)
    const gridOffsetX = Math.floor(offsetX / tilesize)
    const gridOffsetY = Math.floor(offsetY / tilesize)

    for(let i = 0; i < subGridWidth; i++) {
        for(let j = 0; j < subGridHeight; j++) {
            const gridPoint = new Point(i + gridOffsetX, j + gridOffsetY)
            const x = i * tilesize
            const y = j * tilesize

            const color = world.reliefMap.codeMap.getColor(gridPoint)
            context.fillStyle = color
            context.fillRect(x, y, tilesize, tilesize)
        }
    }
}

const drawWorldTile = (context, point, tilesize, color) => {

}