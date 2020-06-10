import React, { useState } from 'react'

import { createRegionMap } from '/model/regionmap'
import MapAppMenu from './menu'
import RegionMapView from './view'


export default function RegionMapApp() {
    const [regionMap, setRegionMap] = useState(prev => prev || createRegionMap())
    const onConfigChange = config => setRegionMap(createRegionMap(config))

    return <section className='MapApp'>
        <MapAppMenu onChange={onConfigChange} />
        <RegionMapView regionMap={regionMap} />
    </section>
}