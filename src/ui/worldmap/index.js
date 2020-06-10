import React, { useState } from 'react'

import WorldMap from '/model/worldmap'
import WorldMenu from './menu'
import WorldMapView from './view'


export default function WorldMapApp() {
    let [worldMap, setWorldMap] = useState(new WorldMap())

    const onConfigChange = config => setWorldMap(new WorldMap(config))

    return <section className='MapApp'>
        <WorldMenu onChange={onConfigChange} />
        <WorldMapView worldMap={worldMap} />
    </section>
}