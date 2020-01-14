import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldApp from '/ui/world'
import { Row, Form, Layout, Text } from '/ui/lib'
import { SelectField } from '/ui/lib/field'

import "./base.css"
import "./index.css"


const APPS = {
    world: { name: 'World', component: <WorldApp /> }
}
const DEFAULT_APP = APPS.world


function Nami() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <Layout className="NamiApp">
        <Navigation app={app} setApp={setApp} height='50px' />
        <Content app={app} />
    </Layout>
}

function Content({app}) {
    return <Row className="Content">
        {app.component}
    </Row>
}

function Navigation({setApp}) {
    return <Layout className="NamiNavigation">
        <Text className="NamiTitle">Nami</Text>
        <Form className="NamiConfig">
            <AppSelect apps={APPS} current={DEFAULT_APP} onChange={setApp} />
        </Form>
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