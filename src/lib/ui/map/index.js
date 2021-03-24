import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { UIMapScene } from './scene'


export function UIMap({model}) {
    const [data, setData] = useState(model.schema.parse())
    const map = model.create(data)

    return <section className='UIMap'>
        <Form className="Map"
            data={data}
            onSubmit={setData}>
            <Button label="New" />
        </Form>
        <UIMapDiagram diagram={model.diagram} map={map} />
    </section>
}


function UIMapDiagram({diagram, map}) {
    const [data, setData] = useState(diagram.schema.parse())
    const mapDiagram = diagram.create(map, data)

    return <>
        <Form className="MapDiagram"
            onSubmit={setData}
            data={data}
        >
            <Button label="Update" />
        </Form>
        <UIMapScene diagram={mapDiagram} />
    </>
}