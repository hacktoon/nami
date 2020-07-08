import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'

import { RegionMap } from '/model/regionmap'
import { RegionMapImage } from '/model/regionmap/image'


export default function RegionMapApp() {
    const [map, setMap] = useState(RegionMap.create())
    const [image, setImage] = useState(RegionMapImage.create(map))

    const handleMap = config => setMap(RegionMap.create(config))
    const handleImage = config => setImage(RegionMapImage.create(map, config))

    return <section className='MapApp'>
        <Form meta={RegionMap.meta}
              onSubmit={handleMap}
              onChange={handleMap}>
            <Button label="New" />
        </Form>
        <Form meta={RegionMapImage.meta}
              onSubmit={handleImage}
              onChange={handleImage}>
        </Form>
        <MapImage image={image} />
    </section>
}
