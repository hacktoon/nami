import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldApp from '/ui/world'
import RegionsApp from '/ui/regions'
import { Component, Text } from '/ui/lib'
import { SelectField } from '/ui/lib/field'

import "./base.css"
import "./index.css"


const APPS = {
    world: { id: 'world', name: 'World', component: <WorldApp /> },
    regions: { id: 'regions', name: 'Regions', component: <RegionsApp /> }
}
const DEFAULT_APP = APPS.world


function Nami() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <Component className="NamiApp">
        <NamiHeader app={app} setApp={setApp} />
        {app.component}
    </Component>
}

function NamiHeader({app, setApp}) {
    return <Component className="NamiHeader">
        <Text className="NamiTitle">Nami</Text>
        <NamiMenu app={app} setApp={setApp} />
    </Component>
}

function NamiMenu({app, setApp}) {
    return <Component className="NamiMenu">
        <AppSelect apps={APPS} current={app} setApp={setApp} />
    </Component>
}

function AppSelect({ apps, current, setApp }) {
    const onChange = event => {
        const id = event.target.value
        setApp(apps[id])
    }

    const appOptions = Object.fromEntries(
        Object.entries(apps).map(entry => {
            const [id, app] = entry
            return [id, app.name]
        }))

    return <SelectField
        label="App"
        value={current.id}
        options={appOptions}
        onChange={onChange}
    />
}


ReactDOM.render(<Nami />, document.getElementById('root'));