import React, { useState } from 'react'

import { NumberField } from '../lib/field'
import { Form, Button } from '../lib'


export default function RegionsMenu(props) {
    let [points, setPoints] = useState(8)

    const onPointsChange = event => {
        const points = Number(event.target.value)
        setPoints(points)
        // props.onChange(config)
    }

    let onSubmit = () => {}

    return <Form className="RegionsMenu" onSubmit={onSubmit}>
        <NumberField
            label="Points"
            value={points}
            onChange={onPointsChange}
            step={1}
            min={1}
        />
        <Button  text="Build" />
    </Form>
}
