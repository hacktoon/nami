import React, { useState } from 'react'

import { createCityMap } from '/model/citymap'
import ConfigMenu from './menu'
import CityMapView from './view'

import "./index.css"


export default function CityMapApp() {
    const [cityMap, setCityMap] = useState(createCityMap())
    const onConfigChange = config => setCityMap(createCityMap(config))

    return <section className='CityMapApp'>
        <ConfigMenu onChange={onConfigChange} />
        <CityMapView cityMap={cityMap} />
    </section>
}