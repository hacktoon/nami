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
        <MapMenu map={map} config={config} onChange={cfg => setConfig(cfg)} />
        <MapImage map={map}
            //REMOVE BELOW=====================================
            colorAt={point => view.colorAt(point, config.layer, config.border, config.origin)}
            tilesize={config.tilesize}
            wrapMode={config.wrapMode}
        />
    </section>
}


function MapMenu({map, config, onChange}) {
    function handleChange(event) {
        event.preventDefault()
        const newConfig = readForm(event)
        console.log(newConfig)
        // onChange(newConfig)
    }

    function readForm(event) {
        return {
            fgColor: event.currentTarget.fgColorField.value,
            bgColor: event.currentTarget.bgColorField.value,
            borderColor: event.currentTarget.borderColorField.value,
            wrapMode: event.currentTarget.wrapField.value,
            border: event.currentTarget.borderField.value,
            origin: event.currentTarget.originField.value,
            layer: event.currentTarget.layerField.value,
            tilesize: event.currentTarget.tilesizeField.value,
        }
    }

    return <Form className="MapMenu" onChange={handleChange} onSubmit={handleChange}>
        {buildFields(map.view.fields)}
        <SubmitButton text="Update" />
    </Form>
}
