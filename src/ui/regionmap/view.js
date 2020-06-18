import React, { useState } from 'react'

import { Button, Form } from '/lib/ui/form'
import { buildFields, ColorField } from '/lib/ui/form/field'
import { MapImage } from '/lib/ui/map'
import {
    OutputField,
    NumberField,
    BooleanField
} from '/lib/ui/form/field'


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
    let [config, setConfig] = useState({
        bgColor: map.view.bgColor,
        border: map.view.border,
        borderColor: map.view.borderColor,
        fgColor: map.view.fgColor,
        layer: map.view.layer,
        origin: map.view.origin,
        tilesize: map.view.tilesize,
        wrapMode: map.view.wrapMode,
    })

    const view = map.buildView(config)

    return <section className="MapAppView">
        <MapMenu config={config} onChange={cfg => setConfig(cfg)} />
        <MapImage map={map}
            //REMOVE BELOW=====================================
            colorAt={point => view.colorAt(point, config.layer, config.border, config.origin)}
            tilesize={config.tilesize}
            wrapMode={config.wrapMode}
        />
    </section>
}


function MapMenu({config, onChange}) {
    function handleChange(event) {
        event.preventDefault()
        const newConfig = readForm(event)
        console.log(newConfig)

        //onChange(newConfig)
    }

    function readForm(event) {
        return {
            fgColor: event.currentTarget.fgColorField.value,
            bgColor: event.currentTarget.bgColorField.value,
            borderColor: event.currentTarget.borderField.value,
            wrapMode: event.currentTarget.wrapField.value,
            border: event.currentTarget.borderField.value,
            origin: event.currentTarget.originField.value,
            layer: event.currentTarget.layerField.value,
            tilesize: event.currentTarget.tilesizeField.value,
        }
    }


    const fields = [
        {
            type: BooleanField,
            name: "wrapField",
            label: "Wrap grid",
            value: config.wrapMode,
        },
        {
            type: BooleanField,
            name: "borderField",
            label: "Show border",
            value: config.border,
        },
        {
            type: BooleanField,
            name: "originField",
            label: "Show origin",
            value: config.origin,
        },
        {
            type: NumberField,
            name: "tilesizeField",
            label: "Tile size",
            value: config.tilesize,
            step: 1,
            min: 1,
        },
        {
            type: NumberField,
            name: "layerField",
            label: "Layer",
            value: config.layer,
            step: 1,
            min: 0,
        },
        {
            type: ColorField,
            name: "fgColorField",
            label: "FG color",
            value: config.fgColor,
        },
        {
            type: ColorField,
            name: "bgColorField",
            label: "BG color",
            value: config.bgColor,
        },
        {
            type: ColorField,
            name: "borderColorField",
            label: "Border color",
            value: config.borderColor,
        }
    ]

    return <Form className="MapMenu" onSubmit={handleChange}>
        {buildFields(fields)}
        <Button text="Update" />
    </Form>
}

// show output field in a specific grid view component
// <OutputField label="Seed" value={props.map.seed} />