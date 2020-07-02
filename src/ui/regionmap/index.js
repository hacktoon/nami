import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'

import { RegionMap } from '/model/regionmap'


export default function RegionMapApp() {
    const [config, setConfig] = useState(RegionMap.schema.defaults)
    const regionMap = RegionMap.create(config)

    return <section className='MapApp'>
        <Form type={RegionMap} onSubmit={setConfig} onChange={setConfig}>
            <Button label="New" />
        </Form>
        <MapImage type={RegionMap.Image} map={regionMap} />
    </section>
}
