import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapView } from './view'


export function MapApp({Map}) {
    const [map, setMap] = useState(prev => prev ?? Map.create())
    const handleMap = config => {
        setMap(Map.create(config))
    }

    return <section className='MapApp'>
        <Form className="Map"
            meta={Map.meta}
            values={map.config}
            onSubmit={handleMap}
            onChange={handleMap}>
                <Button label="New" />
        </Form>
        <MapAppView Diagram={Map.Diagram} map={map} />
    </section>
}


function MapAppView({Diagram, map}) {
    const [config, setConfig] = useState({})
    const diagram = Diagram.create(map, config)

    const handleZoom = amount => {
        const tileSize = diagram.tileSize + amount
        setConfig({...config, tileSize})
    }

    return <>
        <Form className="Diagram"
              meta={Diagram.meta}
              values={diagram.config}
              onSubmit={setConfig}
              onChange={setConfig} />
        <MapView diagram={diagram} onZoom={handleZoom} />
    </>
}