import React from 'react'

import { RegionsConfig } from '/model/region'
import { Form, Button } from '../lib'


export default function RegionsMenu(props) {

    const onSubmit = event => {
        const config = new RegionsConfig({ size, roughness, seed })
        event.preventDefault()
        props.onChange(config)
    }

    return <Form className="RegionsMenu" onSubmit={onSubmit}>
        <Button onClick={onSubmit} text="Build" />
    </Form>
}


