import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WorldApp from '/ui/world'
import { Row, Form, Grid } from '/ui/lib'
import { SelectField } from '/ui/lib/field'

import "./base.css"
import "./index.css"


const APPS = {
    world: { name: 'World', component: <WorldApp /> }
}
const DEFAULT_APP = APPS.world


function Nami() {
    const [app, setApp] = useState(DEFAULT_APP)

    return <Grid className="Nami">
        <section className="NamiTitle">Nami</section>
        <Form className="NamiConfig" layout="RowLayout">
            <AppSelect apps={APPS} current={DEFAULT_APP} onChange={setApp} />
        </Form>
        <Row className="NamiView">
            {app.component}
        </Row>
    </Grid>
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