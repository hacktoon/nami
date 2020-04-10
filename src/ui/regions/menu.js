import React, { useState } from 'react'

import { SelectField, NumberField } from '/lib/ui/field'
import { Form, Button } from '/lib/ui'
import {
    DEFAULT_COUNT,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT
} from '/model/region'


export default function ConfigMenu(props) {
    let [count, setCount] = useState(DEFAULT_COUNT)
    let [width, setWidth] = useState(DEFAULT_WIDTH)
    let [height, setHeight] = useState(DEFAULT_HEIGHT)
    let [grow, setGrow] = useState('organic')

    const growOptions = {
        normal: 'Normal',
        organic: 'Organic',
    }

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({count, width, height})
    }

    return <Form className="ConfigMenu" onSubmit={onSubmit}>
        <NumberField
            label="Width"
            value={width}
            onChange={event => setWidth(Number(event.target.value))}
            step={1}
            min={1}
        />
        <NumberField
            label="Height"
            value={height}
            onChange={event => setHeight(Number(event.target.value))}
            step={1}
            min={1}
        />
        <NumberField
            label="Count"
            value={count}
            onChange={event => setCount(Number(event.target.value))}
            step={1}
            min={1}
        />
        <SelectField label="Grow" value={grow}
            onChange={event => setGrow(event.target.value)}
            options={growOptions} />
        {/* <NumberField
            label="Overgrow chance"
            value={1}
            step={1}
            min={1}
        /> */}
        <Button text="New" />
    </Form>
}
