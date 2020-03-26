import React, { useState } from 'react'

import { RegionMap } from '/model/region'
import ConfigMenu from './menu'
import RegionMapView from './view'

import "./index.css"


const DEFAULT_REGION_MAP = new RegionMap()


export default function RegionMapApp() {
    const [regionMap, setRegionMap] = useState(DEFAULT_REGION_MAP)

    const onConfigChange = config => setRegionMap(new RegionMap(config))

    return <section className='RegionMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <RegionMapView regionMap={regionMap} />
    </section>
}