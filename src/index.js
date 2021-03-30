import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Form } from '/ui/form'
import { Title } from '/ui'

import TectonicsTileMap from '/model/tilemap/world/tectonics'
import HeightTileMap from '/model/tilemap/height/'
import RegionTileMap from '/model/tilemap/region'
import RegionGroupTileMap from '/model/tilemap/regiongroup'
import NoiseTileMap from '/model/tilemap/noise'

import "/ui/css/base.css"
import "/ui/css/map.css"


const APPS = [
    HeightTileMap,
    NoiseTileMap,
    TectonicsTileMap,
    RegionTileMap,
    RegionGroupTileMap,
]


const appMap = new Map(APPS.map(TileMap => {
    return [TileMap.id, () => <TileMap.ui TileMap={TileMap} />]
}))


class App {
    static schema = new Schema(
        'App',
        Type.selection('app', 'App', {default: RegionGroupTileMap.id, options: APPS})
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
            </Form>
        </section>
        <Application />
    </section>
}


ReactDOM.render(<RootComponent />, document.getElementById('app'));