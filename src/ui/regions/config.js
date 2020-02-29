import React, { useState } from 'react'

import { NumberField } from '../lib/field'
import { Form, Component, Button } from '../lib'


export default function Config(props) {
    let [points, setPoints] = useState(3)

    const onPointsChange = event => setPoints(Number(event.target.value))

    const onSubmit = event => {
        const config = {}
        event.preventDefault()
        props.onChange(config)
    }

    return <Component className="RegionsConfig">
        <Form onSubmit={onSubmit}>
            <NumberField
                label="Points"
                value={points}
                step={1}
                min={1}
                onChange={onPointsChange} />
            <Button onClick={onSubmit} text="Build" />
        </Form>
    </Component>
}
