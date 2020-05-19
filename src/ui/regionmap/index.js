import React, { useState } from 'react'

import { Color } from '/lib/color'
import { createRegionMap } from '/model/regionmap'
import ConfigMenu from './menu'
import RegionMapView from './view'

import "./index.css"


export default function RegionMapApp() {
    const [regionMap, setRegionMap] = useState(createRegionMap())
    const onConfigChange = config => setRegionMap(createRegionMap(config))

    const colorMap = Object.fromEntries(
        regionMap.regions.map(region => [
            region.id, new Color()
        ])
    )

    return <section className='RegionMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <RegionMapView regionMap={regionMap} colorMap={colorMap} />
    </section>
}