import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'

import { RegionMap } from '/model/regionmap'


export default function RegionMapApp() {
    const [map, setMap] = useState(RegionMap.create())
    const handle = config => setMap(RegionMap.create(config))
    return <section className='MapApp'>
        <Form schema={RegionMap.schema}
              onSubmit={handle}
              onChange={handle}>
            <Button label="New" />
        </Form>
        <MapImage Type={RegionMap.Image} map={map} />
    </section>
}
