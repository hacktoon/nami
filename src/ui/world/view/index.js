import React, { useState } from 'react'

import { ViewCanvas, TrackerPanel } from './display'
import { OptionsPanel } from './options'
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
        <section className="view-panel">
            <ViewCanvas onReady={drawFunction} />
            <TrackerPanel world={props.world} onDrag={setOffset} tilesize={tilesize} />
        </section>
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
