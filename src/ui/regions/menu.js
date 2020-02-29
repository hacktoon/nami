import React from 'react'

import { Form, Button } from '../lib'


export default function RegionsMenu(props) {
    let onSubmit = () => {}
    return <Form className="RegionsMenu" onSubmit={onSubmit}>
        <Button  text="Build" />
    </Form>
}
