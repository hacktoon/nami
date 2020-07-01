import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'

import { RegionMap, createRegionMap } from '/model/regionmap'
import RegionMapView from './view'


export default function RegionMapApp() {
    const [config, setConfig] = useState(RegionMap.schema.defaults)
    const regionMap = createRegionMap(config)

    return <section className='MapApp'>
        <RegionMapForm schema={RegionMap.schema} onChange={cfg => setConfig(cfg)}  />
        <RegionMapView map={regionMap} />
    </section>
}


function RegionMapForm({schema, onChange}) {
    const props = {
        schema: schema,
        onSubmit: onChange,
        onChange: onChange,
        className: "MapImageForm"
    }
    return <Form {...props}>
        <Button text="New" />
    </Form>
}
