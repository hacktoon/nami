import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapSceneUI } from './scene'


export function MapUI({model}) {
    const [data, setData] = useState(model.schema.parse())
    const map = model.create(data)

    return <section className='MapUI'>
        <Form className="Map"
            data={data}
            onSubmit={setData}>
            <Button label="New" />
        </Form>
        <MapDiagramUI diagram={model.diagram} map={map} />
    </section>
}


function MapDiagramUI({diagram, map}) {
    const [data, setData] = useState(diagram.schema.parse())
    const mapDiagram = diagram.create(map, data)

    return <>
        <Form className="MapDiagram"
            onSubmit={setData}
            data={data}
        >
            <Button label="Update" />
        </Form>
        <MapSceneUI diagram={mapDiagram} />
    </>
}