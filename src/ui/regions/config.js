import React, { useState } from 'react'

import { TextField } from '../lib/field'
import { Form, Row, Button } from '../lib'


export default function Config(props) {
    let [seed, setSeed] = useState('')

    const onSeedChange = event => setSeed(event.target.value.trim())

    const onSubmit = event => {
        const config = {}
        event.preventDefault()
        props.onChange(config)
    }

    return <Form className="RegionsConfig" onSubmit={onSubmit}>
        <Row>
            <TextField  label="Seed" onChange={onSeedChange} />
            <Button onClick={onSubmit} text="Build" />
        </Row>
    </Form>
}


