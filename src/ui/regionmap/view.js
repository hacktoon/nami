import React, { useState } from 'react'

import { Form2 } from '/lib/ui/form'
import { SubmitButton } from '/lib/ui/form/button'
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

    const renderMap = map.view.build(config)

    return <section className="MapAppView">
        <MapMenu map={map} onChange={cfg => setConfig(cfg)} />
        <MapImage map={map} renderMap={renderMap}
            //REMOVE BELOW=====================================
            colorAt={point => renderMap.colorAt(point, config)}
            tilesize={config.tilesize}
            wrapMode={config.wrapMode}
        />
    </section>
}


function MapMenu({map, onChange}) {
    const props = {
        fields: map.view.fields,
        onSubmit: onChange,
        onChange,
    }
    return (
        <Form2 className="MapMenu" {...props}>
            <SubmitButton text="Update" />
        </Form2>
    )
}
