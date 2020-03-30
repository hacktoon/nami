import React, { useState } from 'react'

import { Menu } from './menu'
import { GridDisplay } from '/lib/ui/display'


const DEFAULT_TILE_SIZE = 10


export default function WorldView({world}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [gridMode, setGridMode] = useState(false)

    return <section className='WorldView'>
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            onGridModeChange={() => setGridMode(!gridMode)}
            world={world}
            tilesize={tilesize}
            gridMode={gridMode}

        />
        <GridDisplay
            colorAt={point => world.getColor(point)}
            tilesize={tilesize}
            gridMode={gridMode}
        />
    </section>
}