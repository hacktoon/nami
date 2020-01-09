import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldBuilderApp from './ui/world'
import AppInput from './ui'
import { Row } from './ui/lib'

import "./base.css"
import "./index.css"


const APPS = {
    world: { name: 'World builder', component: <WorldBuilderApp /> }
}
const DEFAULT_APP = APPS.world


function Nami() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <>
        <Row className="AppBar">
            <section className="Title">Nami</section>
            <section className="Menu">
                <AppInput apps={APPS} current={DEFAULT_APP} onChange={setApp} />
            </section>
        </Row>
        {app.component}
    </>
}

ReactDOM.render(<Nami />, document.getElementById('nami-app'));