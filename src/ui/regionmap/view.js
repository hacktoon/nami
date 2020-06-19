import React, { useState } from 'react'

import { SubmitButton, Form } from '/lib/ui/form'
import { buildFields } from '/lib/ui/form/field'
import { MapImage } from '/lib/ui/map'


// TODO: refactor to this
// export function _MapView({map}) {
//     let [config, setConfig] = useState(map.view.DEFAULT_CONFIG)

//     return <section className="MapView">
//         <MapMenu config={config} onChange={cfg => setConfig(cfg)} />
//         <MapImage config={config} map={map} />
//     </section>
// }
// createMapView
// bundles all base properties together
// implement the protocol


export default function RegionMapView({map}) {
    let [config, setConfig] = useState(map.view.defaultValues)

    const view = map.buildView(config)

    return <section className="MapAppView">
        <MapMenu map={map} onChange={cfg => setConfig(cfg)} />
        <MapImage map={map}
            //REMOVE BELOW=====================================
            colorAt={point => view.colorAt(point, config)}
            tilesize={config.tilesize}
            wrapMode={config.wrapMode}
        />
    </section>
}


function MapMenu({map, onChange}) {
    function handleChange(event) {
        event.preventDefault()
        const newConfig = formData(event)
        console.log(newConfig)
        // onChange(newConfig)
    }

    function formData(event) {
        return Object.fromEntries(map.view.fields.map(
            field => [field.name, event.currentTarget[field.name].value]
        ))
    }

    return <Form className="MapMenu" onChange={handleChange} onSubmit={handleChange}>
        {buildFields(map.view.fields)}
        <SubmitButton text="Update" />
    </Form>
}
