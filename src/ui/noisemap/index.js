import React, { useState } from 'react'

import { createNoiseMap } from '/model/noisemap'
import AppMenu from './menu'
import HeightMapView from './view'


export default function NoiseMapApp() {
    const [noiseMap, setNoiseMap] = useState(createNoiseMap())
    const onConfigChange = config => setNoiseMap(createNoiseMap(config))

    return <section className='MapApp'>
        <AppMenu onChange={onConfigChange} />
        <HeightMapView noiseMap={noiseMap} />
    </section>
}