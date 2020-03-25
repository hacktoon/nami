import React, { useState } from 'react'

import { RegionMapConfig, RegionMap } from '/model/region'
import ConfigMenu from './menu'
import RegionMapView from './view'

import "./index.css"


function buildRegion(config = new RegionMapConfig()) {
    const regionMap = new RegionMap(config)
    return regionMap
}

const defaultRegionMap = buildRegion()


export default function RegionMapApp() {
    const [regionMap, setRegionMap] = useState(defaultRegionMap)

    const onConfigChange = config => setRegionMap(buildRegion(config))

    return <section className='RegionMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <RegionMapView regionMap={regionMap} />
    </section>
}