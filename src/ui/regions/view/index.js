import React, { useState } from 'react'

import { Component } from '/ui/lib'
import ViewMenu from './menu'
import View from './view'


const DEFAULT_TILE_SIZE = 10


export default function RegionsView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    return <Component className='RegionsView'>
        <ViewMenu
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={props.world}
            tilesize={tilesize}
        />
        <View />
    </Component>
}
