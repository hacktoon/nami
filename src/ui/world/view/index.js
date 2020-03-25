import React, { useState } from 'react'

import { Menu } from './menu'
import { GridDisplay } from '/ui/lib/display'


const DEFAULT_TILE_SIZE = 10


export default function WorldView({world}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    return <section className='WorldView'>
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={world}
            tilesize={tilesize}
        />
        <GridDisplay
            colorAt={point => world.getColor(point)}
            tilesize={tilesize}
        />
    </section>
}