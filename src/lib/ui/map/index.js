import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapSceneUI } from './scene'


export function MapUI({model}) {
    const [data, setData] = useState(model.schema.parse())
    const map = model.create(data)

    const handleSubmit = data => setData(data)

    return <section className='MapUI'>
        <Form className="Map"
            schema={model.schema}
            data={data}
            onSubmit={handleSubmit}>
            <Button label="New" />
        </Form>
        <MapDiagramUI diagram={model.diagram} map={map} />
    </section>
}


function MapDiagramUI({diagram, map}) {
    const [data, setData] = useState(diagram.schema.parse())
    const mapDiagram = diagram.create(map, data)

    const handleSubmit = data => setData(data)

    return <>
        <Form className="MapDiagram"
            schema={diagram.schema}
            onSubmit={handleSubmit}
            data={data}
        >
            <Button label="Update" />
        </Form>
        <MapSceneUI diagram={mapDiagram} />
    </>
}