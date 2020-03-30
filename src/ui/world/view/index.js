import React, { useState } from 'react'

import { Menu } from './menu'
import { GridDisplay } from '/lib/ui/display'


const DEFAULT_TILE_SIZE = 10


export default function WorldView({world}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [gridMode, setGridMode] = useState(false)
    const [wrapMode, setWrapMode] = useState(false)

    return <section className='WorldView'>
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            onGridModeChange={() => setGridMode(!gridMode)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            tilesize={tilesize}
            gridMode={gridMode}
            wrapMode={wrapMode}
            world={world}

        />
        <GridDisplay
            width={world.width}
            height={world.height}
            colorAt={point => world.getColor(point)}
            tilesize={tilesize}
            gridMode={gridMode}
            wrapMode={wrapMode}
        />
    </section>
}