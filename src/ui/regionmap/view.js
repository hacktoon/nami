import React, { useState } from 'react'

import { Form2 } from '/lib/ui/form'
import { SubmitButton } from '/lib/ui/form/button'
import { MapImage } from '/lib/ui/map'



// createMapView
// bundles all base properties together
// implement the protocol


export default function RegionMapView({map}) {
    let [config, setConfig] = useState(map.image.defaultValues)

    const image = map.image.build(config)

    return <section className="MapAppView">
        <MapMenu map={map} onChange={cfg => setConfig(cfg)} />
        <MapImage map={map} image={image} />
    </section>
}


function MapMenu({map, onChange}) {
    const props = {
        fields: map.image.fields,
        onSubmit: onChange,
        onChange,
    }
    return <Form2 className="MapMenu" {...props}></Form2>
}
