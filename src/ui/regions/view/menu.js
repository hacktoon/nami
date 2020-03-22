import React from 'react'

import { Form } from '/ui/lib'
import { NumberField, TextField } from '/ui/lib/field'


export default function Menu(props) {
    return <Form className="Menu">
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <TextField
            label="Fill color"
        />
        <TextField
            label="Border color"
        />
    </Form>
}