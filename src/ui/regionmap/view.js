import React, { useState } from 'react'

import { Button, Form } from '/lib/ui/form'
import { MapImage } from '/lib/ui/map'
import {
    TextField,
    OutputField,
    NumberField,
    BooleanField
} from '/lib/ui/form/field'


const DEFAULT_TILE_SIZE = 5
const DEFAULT_LAYER = 5
const DEFAULT_FG = '#06F'
const DEFAULT_BG = '#251'
const DEFAULT_BORDER = '#944'


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
    //REMOVE BELOW
    const [fgColor, setFGColor] = useState(DEFAULT_FG)
    const [bgColor, setBGColor] = useState(DEFAULT_BG)
    const [borderColor, setBorderColor] = useState(DEFAULT_BORDER)
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [layer, setLayer] = useState(DEFAULT_LAYER)
    const [border, setBorder] = useState(false)
    const [origin, setOrigin] = useState(false)
    //END REMOVE

    let [config, setConfig] = useState({fgColor, bgColor, borderColor})
    const view = map.view(config)
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
