import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Form } from '/ui/form'
import { Button } from '/ui/form/button'
import { Title } from '/ui'

import { TestApp } from '/ui/test'
import TectonicsMap from '/model/map/world/tectonics'
import HeightMap from '/model/map/height/'
import RegionMap from '/model/map/region'
import RegionGroupMap from '/model/map/regiongroup'
import NoiseMap from '/model/map/noise'

import "/ui/css/base.css"
import "/ui/css/map.css"


const APPS = [
    TestApp,
    HeightMap,
    NoiseMap,
    TectonicsMap,
    RegionMap,
    RegionGroupMap,
]


const appMap = new Map(APPS.map(model => {
    return [model.id, () => <model.ui model={model} />]
}))


class App {
    static schema = new Schema(
        Type.selection('app', 'App', {default: RegionGroupMap.id, options: APPS})
    )
}


function RootComponent() {
    const [data, setData] = useState(App.schema.parse())
    const Application = appMap.get(data.get('app'))

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <Form className="AppHeaderMenu"
                data={data}
                onSubmit={setData}>
                <Button label="Run" />
            </Form>
        </section>
        <Application />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));