import React from 'react'

import { Form } from '/lib/ui/form'
import {
    NumberField,
    SelectField,
    OutputField,
    BooleanField
} from '/lib/ui/form/field'


export function MapMenu(props) {
    return <Form className="MapMenu">
        <OutputField label="Name" value={props.map.name} />
        <OutputField label="Seed" value={props.map.seed} />
        <BooleanField
            label="Wrap grid"
            value={props.wrapMode}
            onChange={props.onWrapModeChange}
        />
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <SelectField label="Layer" options={{
            heightmap: "Height map",
        }} />
    </Form>
}