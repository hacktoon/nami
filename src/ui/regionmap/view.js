import React, { useState } from 'react'

import { SubmitButton, Form2 } from '/lib/ui/form'
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
    function handleChange(data) {
        event.preventDefault()
        // console.log(data)
        //onChange(newConfig)
    }

    return <Form2
        className="MapMenu"
        onChange={handleChange}
        onSubmit={handleChange}
        fields={map.view.fields}>
        <SubmitButton text="Update" />
    </Form2>
}
