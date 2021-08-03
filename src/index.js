import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Form } from '/ui/form'
import { Title } from '/ui'

import { NoiseTileMap } from '/model/tilemap/noise'
import { RegionTileMap } from '/model/tilemap/region'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { GeologyTileMap } from '/model/tilemap/world/geology'
import { TemperatureTileMap } from '/model/tilemap/world/temperature'

import "/ui/css/base.css"
import "/ui/css/map.css"


const APPS = [
    NoiseTileMap,
    RegionTileMap,
    RegionGroupTileMap,
    GeologyTileMap,
    TemperatureTileMap,
]


const appMap = new Map(APPS.map(TileMap => {
    const UITileMap = TileMap.ui
    return [TileMap.id, () => <UITileMap TileMap={TileMap} />]
}))


class App {
    static schema = new Schema(
        'App',
        Type.selection('app', 'App', {default: GeologyTileMap.id, options: APPS})
    )
}


function RootComponent() {
    const [data, setData] = useState(App.schema.build())
    const Application = appMap.get(data.get('app'))

    return <section className="App">
        <section className="AppHeader">
            <Title className="AppTitle">NAMI</Title>
            <Form className="AppHeaderMenu"
                data={data}
                onSubmit={setData}>
            </Form>
        </section>
        <Application />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));