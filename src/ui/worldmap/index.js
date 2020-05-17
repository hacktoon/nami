import React, { useState } from 'react'

import WorldMap from '/model/worldmap'
import WorldMenu from './menu'
import WorldView from './view'

import "./index.css"


export default function WorldMapApp() {
    let [worldMap, setWorldMap] = useState(new WorldMap())

    const onConfigChange = config => setWorldMap(new WorldMap(config))

    return <section className='WorldApp'>
        <WorldMenu onChange={onConfigChange} />
        <WorldView worldMap={worldMap} />
    </section>
}