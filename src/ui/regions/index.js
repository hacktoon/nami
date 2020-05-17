import React, { useState } from 'react'

import { createRegionMap } from '/model/regionmap'
import ConfigMenu from './menu'
import RegionMapView from './view'

import "./index.css"


export default function RegionMapApp() {
    const [regionMap, setRegionMap] = useState(createRegionMap())
    const onConfigChange = config => setRegionMap(createRegionMap(config))

    return <section className='RegionMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <RegionMapView regionMap={regionMap} />
    </section>
}