import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapView } from '/lib/ui/map'


export default function MapApp({Map}) {
    const [map, setMap] = useState(Map.create())
    const handleMap = config => setMap(Map.create(config))
    return <section className='MapApp'>
        <Form meta={Map.meta} onSubmit={handleMap} onChange={handleMap}>
            <Button label="New" />
        </Form>
        <InteractiveMapView Image={Map.Image} map={map} />
    </section>
}


function InteractiveMapView({Image, map}) {
    const [config, setConfig] = useState(null)
    const image = Image.create(map, config)

    return <>
        <Form meta={Image.meta} onSubmit={setConfig} onChange={setConfig} />
        <MapView map={map} image={image} />
    </>
}