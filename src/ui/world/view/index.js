import React, { useState } from 'react'

import { Display } from './display'
import { ConfigPanel } from './config'
import { Point } from '/lib/point'


const DEFAULT_TILE_SIZE = 4


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const painter = (canvas, width, height, offset) => {
        const config = new PaintConfig({ canvas, width, height, offset, tilesize })
        paintWorld(props.world, config)
    }

    return <section id="world-view">
        <ConfigPanel
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={props.world}
            tilesize={tilesize}
        />
        <Display painter={painter} />
    </section>
}


class PaintConfig {
    constructor(config={}) {
        this.canvas = config.canvas || <canvas />
        this.offset = config.offset || new Point(0, 0)
        this.width = Number(config.width)
        this.height = Number(config.height)
        this.tilesize = Number(config.tilesize)
    }

    get gridWidth() {
        return Math.ceil(this.width / this.tilesize)
    }

    get gridHeight() {
        return Math.ceil(this.height / this.tilesize)
    }

    getGridPoint(i, j) {
        const x = Math.floor(this.offset.x / this.tilesize)
        const y = Math.floor(this.offset.y / this.tilesize)
        return new Point(x + i, y + j)
    }
}


const paintWorld = (world, config) => {
    const { canvas, tilesize, gridWidth, gridHeight } = config
    for(let i = 0; i < gridWidth; i++) {
        for(let j = 0; j < gridHeight; j++) {
            const x = i * tilesize
            const y = j * tilesize
            const gridPoint = config.getGridPoint(i, j)
            canvas.fillStyle = world.reliefMap.codeMap.getColor(gridPoint)
            canvas.fillRect(x, y, tilesize, tilesize)
        }
    }
}