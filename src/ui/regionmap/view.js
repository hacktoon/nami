import React, { useState } from 'react'

import { Button, Form } from '/lib/ui/form'
import { MapImage } from '/lib/ui/map'
import {
    TextField,
    OutputField,
    NumberField,
    BooleanField
} from '/lib/ui/form/field'


// TODO: refactor to this
// export function _MapView({map}) {
//     let [config, setConfig] = useState(map.view.DEFAULT_CONFIG)

//     return <section className="MapImage">
//         <MapMenu config={config} onChange={cfg => setConfig(cfg)} />
//         <MapImage config={config} map={map} />
//     </section>
// }
// createMapView
// bundles all base properties together
// implement the protocol


export default function RegionMapView({map}) {
    //REMOVE
    const [fgColor, setFGColor] = useState(map.view.fgColor)
    const [bgColor, setBGColor] = useState(map.view.bgColor)
    const [borderColor, setBorderColor] = useState(map.view.borderColor)
    const [tilesize, setTilesize] = useState(map.view.tilesize)
    const [wrapMode, setWrapMode] = useState(map.view.wrapMode)
    const [layer, setLayer] = useState(map.view.layer)
    const [border, setBorder] = useState(map.view.border)
    const [origin, setOrigin] = useState(map.view.origin)
    //END REMOVE

    let [config, setConfig] = useState({fgColor, bgColor, borderColor})
    const view = map.buildView(config)
    //const view = map.view.build(config)

    return <section className="MapAppView">
        <MapMenu map={map} onChange={cfg => setConfig(cfg)}
            // REMOVE BELOW=====================================
            onLayerChange={({value}) => setLayer(value)}
            onBorderChange={() => setBorder(!border)}
            onOriginChange={() => setOrigin(!origin)}
            onTilesizeChange={({value}) => setTilesize(value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            onFGColorChange={event => setFGColor(event.target.value)}
            onBGColorChange={event => setBGColor(event.target.value)}
            onBorderColorChange={event => setBorderColor(event.target.value)}
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
        event.preventDefault();
        console.log(event.currentTarget.wrapField.value);

    }

    return <Form className="MapMenu" onSubmit={handleSubmit}>
        <OutputField label="Seed" value={props.map.seed} />
        <BooleanField
            label="Wrap grid"
            value={props.wrapMode}
            name="wrapField"
            onChange={props.onWrapModeChange}
        />
        <BooleanField
            label="Show border"
            value={props.border}
            name="borderField"
            onChange={props.onBorderChange}
        />
        <BooleanField
            label="Show origin"
            value={props.origin}
            name="originField"
            onChange={props.onOriginChange}
        />
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
            name="tilesizeField"
        />
        <NumberField
            label="Layer"
            value={props.layer}
            onChange={props.onLayerChange}
            step={1}
            min={0}
            name="layerField"
        />
        <TextField
            label="FG color"
            value={props.fgColor}
            onChange={props.onFGColorChange}
            name="fgColorField"
        />
        <TextField
            label="BG color"
            value={props.bgColor}
            onChange={props.onBGColorChange}
            name="bgColorField"
        />
        <TextField
            label="Border color"
            value={props.borderColor}
            onChange={props.onBorderColorChange}
            name="borderColorField"
        />
        <Button text="Update" />
    </Form>
}
