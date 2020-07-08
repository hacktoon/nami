import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapView } from '/lib/ui/map'

import { RegionMap } from '/model/regionmap'
import { RegionMapImage } from '/model/regionmap/image'


export default function RegionMapApp() {
    const [map, setMap] = useState(RegionMap.create())
    const handleMap = config => setMap(RegionMap.create(config))
    return <section className='MapApp'>
        <Form meta={RegionMap.meta}
              onSubmit={handleMap}
              onChange={handleMap}>
            <Button label="New" />
        </Form>
        <RegionMapView Image={RegionMapImage} map={map} />
    </section>
}


function RegionMapView({Image, map}) {
    const [config, setConfig] = useState(null)
    const image = Image.create(map, config)
    return <>
        <Form meta={Image.meta}
            onSubmit={setConfig}
            onChange={setConfig}>
        </Form>
        <MapView image={image} />
    </>
}