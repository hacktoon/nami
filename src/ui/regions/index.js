import React, { useState } from 'react'

import { RegionMap } from '/model/region'
import ConfigMenu from './menu'
import RegionMapView from './view'

import "./index.css"


export default function RegionMapApp() {
    const [regionMap, setRegionMap] = useState(new RegionMap())
    const onConfigChange = config => setRegionMap(new RegionMap(config))

    return <section className='RegionMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <RegionMapView regionMap={regionMap} />
    </section>
}