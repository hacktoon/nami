import React, { useState } from 'react'

import { Menu } from './menu'
import { GridDisplay } from '/lib/ui/grid'


const DEFAULT_TILE_SIZE = 10


export default function WorldView({worldMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)

    return <section className='WorldView'>
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            tilesize={tilesize}
            wrapMode={wrapMode}
            worldMap={worldMap}

        />
        <GridDisplay
            width={worldMap.width}
            height={worldMap.height}
            colorAt={point => worldMap.getColor(point)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}