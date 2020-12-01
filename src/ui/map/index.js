import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapView } from './view'


export function MapApp({Map}) {
    const [data, setData] = useState(Map.schema.defaultValues())
    const map = Map.create(data)

    const handleSubmit = data => setData(data)

    return <section className='MapApp'>
        <Form className="Map"
            schema={Map.schema}
            data={data}
            onSubmit={handleSubmit}>
                <Button label="New" />
        </Form>
        <MapAppView MapDiagram={Map.MapDiagram} map={map} />
    </section>
}


function MapAppView({MapDiagram, map}) {
    const [data, setData] = useState(MapDiagram.schema.defaultValues())

    const diagram = MapDiagram.create(map, data)

    const handleZoom = amount => {
        const entry = ['tileSize', data.get('tileSize') + amount]
        setData(new Map([...data, entry]))
    }

    const handleDrag = focusPoint => {
        const entry = ['focusPoint', focusPoint]
        setData(new Map([...data, entry]))
    }

    const handleSubmit = data => {
        setData(data)
    }

    return <>
        <Form className="MapDiagram"
            schema={MapDiagram.schema}
            data={data}
            onSubmit={handleSubmit}>
                <Button label="Update" />
        </Form>
        <MapView
            diagram={diagram}
            onZoom={handleZoom}
            onDrag={handleDrag}
        />
    </>
}