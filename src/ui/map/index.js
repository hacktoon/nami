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
            values={map.config}
            onSubmit={handleMap}
            onChange={handleMap}>
                <Button label="New" />
        </Form>
        <MapAppView MapDiagram={Map.MapDiagram} map={map} />
    </section>
}


function MapAppView({MapDiagram, map}) {
    const [config, setConfig] = useState({})
    const diagram = MapDiagram.create(map, config)

    const handleZoom = amount => {
        const tileSize = diagram.tileSize + amount
        setConfig(config => ({...config, tileSize}))
    }

    const handleDrag = focusPoint => {
        setConfig(config => ({...config, focusPoint}))
    }

    return <>
        <Form className="MapDiagram"
            meta={MapDiagram.meta}
            values={diagram.config}
            onSubmit={setConfig}
            onChange={setConfig}
        />
        <MapView
            diagram={diagram}
            onZoom={handleZoom}
            onDrag={handleDrag}
        />
    </>
}