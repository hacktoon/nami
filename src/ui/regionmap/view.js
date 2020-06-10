import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
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
//     let [config, setConfig] = useState(map.DEFAULT_CONFIG)

//     return <section className="MapImage">
//         <MapMenu config={config} onChange={cfg => setConfig(cfg)} />
//         <MapImage config={config} map={map} />
//     </section>
// }


export default function RegionMapView({regionMap}) {
    //render options
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [fgColor, setFGColor] = useState(DEFAULT_FG)
    const [bgColor, setBGColor] = useState(DEFAULT_BG)
    const [borderColor, setBorderColor] = useState(DEFAULT_BORDER)
    const [layer, setLayer] = useState(DEFAULT_LAYER)
    const [border, setBorder] = useState(true)
    const [origin, setOrigin] = useState(false)

    const view = regionMap.view(fgColor, bgColor, borderColor)

    return <section className="MapAppView">
        <MapMenu
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
            seed={regionMap.seed}
        />
        <MapImage
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => view.colorAt(point, layer, border, origin)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function MapMenu(props) {
    return <Form className="MapMenu">
        <OutputField label="Seed" value={props.seed} />
        <BooleanField
            label="Wrap grid"
            value={props.wrapMode}
            onChange={props.onWrapModeChange}
        />
        <BooleanField
            label="Show border"
            value={props.border}
            onChange={props.onBorderChange}
        />
        <BooleanField
            label="Show origin"
            value={props.origin}
            onChange={props.onOriginChange}
        />
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <NumberField
            label="Layer"
            value={props.layer}
            onChange={props.onLayerChange}
            step={1}
            min={0}
        />
        <TextField
            label="FG color"
            value={props.fgColor}
            onChange={props.onFGColorChange}
        />
        <TextField
            label="BG color"
            value={props.bgColor}
            onChange={props.onBGColorChange}
        />
        <TextField
            label="Border color"
            value={props.borderColor}
            onChange={props.onBorderColorChange}
        />
    </Form>
}
