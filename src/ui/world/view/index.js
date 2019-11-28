import React, { useState } from 'react'

import { Display } from './display'
import { OptionsPanel } from './options'
import { Point } from '/lib/point'


const DEFAULT_TILE_SIZE = 16


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const painter = (canvas, width, height, offset) => {
        const config = new PaintConfig({ canvas, width, height, offset, tilesize })
        paintWorld(props.world, config)
    }

    return <section id="world-view">
        <OptionsPanel
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={props.world}
            tilesize={tilesize}
        />
        <Display painter={painter} />
    </section>
}


class PaintConfig {
    constructor(config={}) {
        this.canvas = config.canvas
        this.width = config.width
        this.height = config.height
        this.offset = config.offset
        this.tilesize = config.tilesize
    }

    get gridOffset() {
        return new Point()
    }
}

const paintWorld = (world, config) => {
    const { canvas, width, height, tilesize, offset } = config
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
            canvas.fillStyle = color
            canvas.fillRect(x, y, tilesize, tilesize)
        }
    }
}