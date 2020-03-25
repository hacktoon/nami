import React, { useState } from 'react'

import { RegionsConfig, Regions } from '/model/region'
import ConfigMenu from './menu'
import RegionsView from './view'

import "./index.css"


function buildRegion(config = new RegionsConfig()) {
    const regions = new Regions(config)
    return regions
}


export default function RegionsApp() {
    const [regions, setRegions] = useState(buildRegion())
    const onConfigChange = config => setRegions(buildRegion(config))

    return <section className='RegionsApp'>
        <ConfigMenu onChange={onConfigChange} />
        <RegionsView regions={regions} />
    </section>
}