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
    //REMOVE
    const [bgColor, setBGColor] = useState(map.view.bgColor)
    const [border, setBorder] = useState(map.view.border)
    const [borderColor, setBorderColor] = useState(map.view.borderColor)
    const [fgColor, setFGColor] = useState(map.view.fgColor)
    const [layer, setLayer] = useState(map.view.layer)
    const [origin, setOrigin] = useState(map.view.origin)
    const [tilesize, setTilesize] = useState(map.view.tilesize)
    const [wrapMode, setWrapMode] = useState(map.view.wrapMode)
    //END REMOVE

    let [config, setConfig] = useState({fgColor, bgColor, borderColor})

    const view = map.buildView(config)

    return <section className="MapAppView">
        <MapMenu map={map} config={config} onChange={cfg => setConfig(cfg)}
            // REMOVE BELOW=====================================
            onLayerChange={({value}) => setLayer(value)}
            onBorderChange={({value}) => setBorder(value)}
            onOriginChange={({value}) => setOrigin(value)}
            onTilesizeChange={({value}) => setTilesize(value)}
            onWrapModeChange={({value}) => setWrapMode(value)}
            onFGColorChange={({value}) => setFGColor(value)}
            onBGColorChange={({value}) => setBGColor(value)}
            onBorderColorChange={({value}) => setBorderColor(value)}
            wrapMode={wrapMode}
            fgColor={fgColor}
            bgColor={bgColor}
            borderColor={borderColor}
            tilesize={tilesize}
            layer={layer}
            border={border}
            origin={origin}
        />
        <MapImage map={map}
            //REMOVE BELOW=====================================
            colorAt={point => view.colorAt(point, layer, border, origin)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function MapMenu(props) {
    function handleSubmit(event) {
        event.preventDefault()
        props.onChange({
            fgColor: event.currentTarget.fgColorField.value,
            bgColor: event.currentTarget.bgColorField.value,
            borderColor: event.currentTarget.borderColorField.value,
            wrapMode: event.currentTarget.wrapModeField.value,
            border: event.currentTarget.borderField.value,
            origin: event.currentTarget.originField.value,
            layer: event.currentTarget.layerField.value,
            tilesize: event.currentTarget.tilesizeField.value,
        })
    }

    function handleChange(event) {
        event.preventDefault()
        props.onChange({
            fgColor: event.currentTarget.fgColorField.value,
            bgColor: event.currentTarget.bgColorField.value,
            borderColor: event.currentTarget.borderField.value,
            wrapMode: event.currentTarget.wrapField.value,
            border: event.currentTarget.borderField.value,
            origin: event.currentTarget.originField.value,
            layer: event.currentTarget.layerField.value,
            tilesize: event.currentTarget.tilesizeField.value,
        })
    }

    const fields = [
        {
            type: BooleanField,
            name: "wrapField",
            label: "Wrap grid",
            value: props.wrapMode,
            onChange: props.onWrapModeChange
        },
        {
            type: BooleanField,
            name: "borderField",
            label: "Show border",
            value: props.border,
            onChange: props.onBorderChange,
        },
        {
            type: BooleanField,
            name: "originField",
            label: "Show origin",
            value: props.origin,
            onChange: props.onOriginChange,
        },
        {
            type: NumberField,
            name: "tilesizeField",
            label: "Tile size",
            value: props.tilesize,
            onChange: props.onTilesizeChange,
            step: 1,
            min: 1,
        },
        {
            type: NumberField,
            name: "layerField",
            label: "Layer",
            value: props.layer,
            onChange: props.onLayerChange,
            step: 1,
            min: 0,
        },
        {
            type: ColorField,
            name: "fgColorField",
            label: "FG color",
            value: props.fgColor,
            onChange: props.onFGColorChange,
        },
        {
            type: ColorField,
            name: "bgColorField",
            label: "BG color",
            value: props.bgColor,
            onChange: props.onBGColorChange,
        },
        {
            type: ColorField,
            name: "borderColorField",
            label: "Border color",
            value: props.borderColor,
            onChange: props.onBorderColorChange,
        }
    ]

    return <Form className="MapMenu" onChange={handleChange}>
        <OutputField label="Seed" value={props.map.seed} />
        {buildFields(fields)}
        <Button text="Update" />
    </Form>
}
