import React, { useState } from 'react'

import { createTectonicMap } from '/model/tectonicmap'
import MapAppMenu from './menu'
import TectonicMapView from './view'


export default function TectonicMapApp() {
    const [tectonicMap, setTectonicMap] = useState(prev => prev || createTectonicMap())
    const onConfigChange = config => setTectonicMap(createTectonicMap(config))

    return <section className='MapApp'>
        <MapAppMenu onChange={onConfigChange} />
        <TectonicMapView tectonicMap={tectonicMap} />
    </section>
}