import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'

import { RegionMap } from '/model/regionmap'
import { MapImage } from '/lib/ui/map'


export default function RegionMapApp() {
    const [config, setConfig] = useState(RegionMap.schema.defaults)
    const regionMap = RegionMap.create(config)
    const schema = RegionMap.schema

    return <section className='MapApp'>
        <Form schema={schema} onSubmit={setConfig} onChange={setConfig}>
            <Button label="New" />
        </Form>
        <MapImage map={regionMap} />
    </section>
}
