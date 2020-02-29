import React, { useState } from 'react'

import { View } from './view'
import { Menu } from './menu'
import { Component } from '/ui/lib'
import { PaintConfig } from '/ui/lib/canvas'


const DEFAULT_TILE_SIZE = 10


export default function WorldView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const painter = (canvas, width, height, offset) => {
        const config = new PaintConfig({ canvas, width, height, offset, tilesize })
        paintWorld(props.world, config)
    }

    return <Component className='WorldView'>
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={props.world}
            tilesize={tilesize}
        />
        <View painter={painter} />
    </Component>
}


function paintWorld(world, config){
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