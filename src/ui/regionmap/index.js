import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'

import { RegionMap } from '/model/regionmap'


export default function RegionMapApp() {
    const [config, setConfig] = useState(RegionMap.schema.defaultConfig)
    const regionMap = RegionMap.create(config)

    const handle = data => {
        const newConfig = RegionMap.schema.createConfig(data)
        setConfig(newConfig)
    }

    return <section className='MapApp'>
        <Form type={RegionMap} onSubmit={handle} onChange={handle}>
            <Button label="New" />
        </Form>
        <MapImage type={RegionMap.Image} map={regionMap} />
    </section>
}
