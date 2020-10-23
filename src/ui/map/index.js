import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapView } from './view'


export function MapApp({Map}) {
    const [map, setMap] = useState(prev => prev ?? Map.create())
    const handleMap = config => setMap(Map.create(config))
    return <section className='MapApp'>
        <Form className="Map"
            meta={Map.meta}
            onSubmit={handleMap}
            onChange={handleMap}>
                <Button label="New" />
        </Form>
        <MapAppView Diagram={Map.Diagram} map={map} />
    </section>
}


function MapAppView({Diagram, map}) {
    const [config, setConfig] = useState(null)
    const diagram = Diagram.create(map, config)

    const handleZoom = amount => {
        const newConfig = {...diagram.config, tileSize: diagram.tileSize + amount}
        setConfig(newConfig)
    }

    return <>
        <Form className="Diagram"
              meta={Diagram.meta}
              onSubmit={setConfig}
              onChange={setConfig} />
        <MapView diagram={diagram} onZoom={handleZoom} />
    </>
}