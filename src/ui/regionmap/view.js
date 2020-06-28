import React, { useState } from 'react'

import { Form2 } from '/lib/ui/form'
import { SubmitButton } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'



// createMapView
// bundles all base properties together
// implement the protocol


export default function RegionMapView({map}) {
    let [config, setConfig] = useState(map.ui.defaultValues)

    const renderMap = map.ui.buildRender(config)

    return <section className="MapAppView">
        <MapMenu map={map} onChange={cfg => setConfig(cfg)} />
        <MapImage map={map} renderMap={renderMap} />
    </section>
}


function MapMenu({map, onChange}) {
    const props = {
        fields: map.ui.fields,
        onSubmit: onChange,
        onChange,
    }
    return (
        <Form2 className="MapMenu" {...props}></Form2>
    )
}
