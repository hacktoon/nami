import React, { useState } from 'react'

import { MapMenu } from './menu'
import { MapView } from '/lib/ui/map'


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
            worldMap={worldMap}
        />
        <MapView
            width={worldMap.width}
            height={worldMap.height}
            colorAt={point => worldMap.getColor(point)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}