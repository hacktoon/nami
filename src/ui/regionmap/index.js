import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'

import { RegionMap } from '/model/regionmap'


export default function RegionMapApp() {
    const [config, setConfig] = useState(RegionMap.schema.defaultConfig)
    const regionMap = RegionMap.create(config)

    return <section className='MapApp'>
        <Form schema={RegionMap.schema}
              config={config}
              onSubmit={setConfig}
              onChange={setConfig}>
            <Button label="New" />
        </Form>
        <MapImage Type={RegionMap.Image} map={regionMap} />
    </section>
}
