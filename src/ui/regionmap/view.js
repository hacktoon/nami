import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { MapDisplay } from '/lib/ui/map'



// createMapView
// bundles all base properties together
// implement the protocol


export default function RegionMapView({map}) {
    const [config, setConfig] = useState(map.image.spec.defaults)
    const renderMap = map.image.buildRenderMap(config)

    return <section className="MapAppView">
        <MapImageForm map={map} onChange={cfg => setConfig(cfg)} />
        <MapDisplay renderMap={renderMap} />
    </section>
}


function MapImageForm({map, onChange}) {
    const props = {
        schema: map.image.spec,
        onSubmit: onChange,
        onChange: onChange,
        className: "MapImageForm"
    }
    return <Form {...props}></Form>
}
