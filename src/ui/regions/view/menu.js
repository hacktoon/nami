import React from 'react'

import { Form } from '/ui/lib'
import { TextField } from '/ui/lib/field'


export default function Menu(props) {
    return <Form className="Menu">
        <TextField
            label="Fill color"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
        />
        <TextField
            label="Border color"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
        />
    </Form>
}