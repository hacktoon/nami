import React, { useState } from 'react'

import { createHeightMap } from '/model/heightmap'
import ConfigMenu from './menu'
import HeightMapView from './view'

import "./index.css"


export default function HeightMapApp() {
    const [heightMap, setHeightMap] = useState(createHeightMap())
    const onConfigChange = config => setHeightMap(createHeightMap(config))

    return <section className='HeightMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <HeightMapView heightMap={heightMap} />
    </section>
}