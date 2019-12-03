import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import AppInput from './ui'
import WorldBuilderApp from './ui/world'

import "./base.css"
import "./index.css"


const APPS = {
    world: {name: 'World builder', component: <WorldBuilderApp />}
}
const DEFAULT_APP = APPS.world


function Nami() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <>
        <header>
            <section id="header-title">Nami</section>
            <section id="header-menu">
                <AppInput apps={APPS} current={DEFAULT_APP} onChange={setApp} />
            </section>
        </header>
        {app.component}
    </>
}

ReactDOM.render(<Nami />, document.getElementById('nami-app'));