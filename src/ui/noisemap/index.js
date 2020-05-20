import React, { useState } from 'react'

import { createNoiseMap } from '/model/noisemap'
import ConfigMenu from './menu'
import HeightMapView from './view'

import "./index.css"


export default function NoiseMapApp() {
    const [noiseMap, setNoiseMap] = useState(createNoiseMap())
    const onConfigChange = config => setNoiseMap(createNoiseMap(config))

    return <section className='NoiseMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <HeightMapView noiseMap={noiseMap} />
    </section>
}