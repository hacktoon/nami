import React, { useState } from 'react'

import { ScanlineFill } from '/lib/flood-fill'
import Menu from './menu'
import { Display, RenderConfig } from '/ui/lib/display'


const DEFAULT_TILE_SIZE = 10


export default function RegionsView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const render = (canvas, width, height, offset) => {
        const config = new RenderConfig({ canvas, width, height, offset, tilesize })
        renderRegions(props.regions, config)
    }

    return <section className="RegionsView">
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            tilesize={tilesize}
        />
        <Display render={render} />
    </section>
}


function renderRegions(regions, config) {
    const { canvas, tilesize, gridWidth, gridHeight } = config
    for(let i = 0; i < gridWidth; i++) {
        for(let j = 0; j < gridHeight; j++) {
            const x = i * tilesize
            const y = j * tilesize
            canvas.fillStyle = 'white'
            canvas.fillRect(x, y, tilesize, tilesize)
        }
    }
}