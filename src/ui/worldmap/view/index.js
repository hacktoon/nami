import React, { useState } from 'react'

import { MapMenu } from './menu'
import { MapImage } from '/lib/ui/map'


const DEFAULT_TILE_SIZE = 10


export default function WorldMapView({worldMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)

    return <section className='MapAppView'>
        <MapMenu
            onTilesizeChange={({value}) => setTilesize(value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            tilesize={tilesize}
            wrapMode={wrapMode}
            map={worldMap}
        />
        <MapImage
            map={worldMap}
            colorAt={point => worldMap.getColor(point)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}