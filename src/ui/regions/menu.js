import React, { useState } from 'react'

import { SelectField, NumberField } from '../lib/field'
import { Form, Button } from '../lib'
import { RegionMapConfig } from '/model/region'


export default function ConfigMenu(props) {
    let [count, setCount] = useState(RegionMapConfig.DEFAULT_COUNT)
    let [size, setSize] = useState(RegionMapConfig.DEFAULT_SIZE)

    const onSizeChange = event => setSize(Number(event.target.value))

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({count, size})
    }

    const sizeOptions = {
        257: 257,
        129: 129,
        65: 65,
    }

    return <Form className="ConfigMenu" onSubmit={onSubmit}>
        <SelectField label="Size" value={size}
            onChange={onSizeChange} options={sizeOptions} />
        <NumberField
            label="Count"
            value={count}
            onChange={event => setCount(Number(event.target.value))}
            step={1}
            min={1}
        />
        <Button text="New" />
    </Form>
}
