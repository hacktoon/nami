import React, { useState } from 'react'

import { View } from './view'
import { Menu } from './menu'
import { RenderConfig } from '/ui/lib/display'


const DEFAULT_TILE_SIZE = 10


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const render = (canvas, width, height, offset) => {
        const config = new RenderConfig({ canvas, width, height, offset, tilesize })
        renderWorld(props.world, config)
    }

    return <section className='WorldView'>
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={props.world}
            tilesize={tilesize}
        />
        <View render={render} />
    </section>
}


function renderWorld(world, config){
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