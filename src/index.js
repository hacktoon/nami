import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldApp from '/ui/world'
import RegionsApp from '/ui/regions'
import { Layout, Text } from '/ui/lib'
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

    return <Layout className="NamiApp">
        <NamiHeader app={app} setApp={setApp} />
        {app.component}
    </Layout>
}

function NamiHeader({app, setApp}) {
    return <Layout className="NamiHeader">
        <Text className="NamiTitle">Nami</Text>
        <NamiMenu app={app} setApp={setApp} />
    </Layout>
}

function NamiMenu({app, setApp}) {
    return <Layout className="NamiMenu">
        <AppSelect apps={APPS} current={app} setApp={setApp} />
    </Layout>
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