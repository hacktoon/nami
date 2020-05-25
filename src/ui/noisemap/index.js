import React, { useState } from 'react'

import { createNoiseMap } from '/model/noisemap'
import MapAppMenu from './menu'
import HeightMapView from './view'


export default function NoiseMapApp() {
    const [noiseMap, setNoiseMap] = useState(createNoiseMap())
    const onConfigChange = config => setNoiseMap(createNoiseMap(config))

    return <section className='MapApp'>
        <MapAppMenu onChange={onConfigChange} />
        <HeightMapView noiseMap={noiseMap} />
    </section>
}