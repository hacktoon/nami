import React, { useState } from 'react'

import { SelectField, NumberField } from '/lib/ui/field'
import { Form, Button } from '/lib/ui'
import { RegionMapConfig } from '/model/region'


export default function ConfigMenu(props) {
    let [count, setCount] = useState(RegionMapConfig.DEFAULT_COUNT)
    let [size, setSize] = useState(RegionMapConfig.DEFAULT_SIZE)
    let [grow, setGrow] = useState('organic')

    const sizeOptions = {
        257: 257,
        129: 129,
        65: 65,
        33: 33,
        17: 17,
    }

    const growOptions = {
        normal: 'Normal',
        organic: 'Organic',
    }

    const onSizeChange = event => setSize(Number(event.target.value))
    const onGrowChange = event => setGrow(Number(event.target.value))

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({count, size})
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
        <SelectField label="Grow" value={grow}
            onChange={onGrowChange} options={growOptions} />
        {/* <NumberField
            label="Overgrow chance"
            value={1}
            step={1}
            min={1}
        /> */}
        <Button text="New" />
    </Form>
}
