import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldApp from '/ui/world'
import RegionsApp from '/ui/regions'
import { Text } from '/ui/lib'
import { SelectField } from '/ui/lib/field'

import "./base.css"
import "./index.css"


const APPS = {
    world: { id: 'world', name: 'World', component: <WorldApp /> },
    regions: { id: 'regions', name: 'Regions', component: <RegionsApp /> }
}
const DEFAULT_APP = APPS.regions


function Main() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <section className="MainApp">
        <MainHeader app={app} setApp={setApp} />
        {app.component}
    </section>
}

function MainHeader({app, setApp}) {
    return <section className="MainHeader">
        <Text className="MainTitle">NAMI</Text>
        <MainMenu app={app} setApp={setApp} />
    </section>
}

function MainMenu({app, setApp}) {
    return <section className="MainMenu">
        <AppSelect apps={APPS} current={app} setApp={setApp} />
    </section>
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


ReactDOM.render(<Main />, document.getElementById('main'));