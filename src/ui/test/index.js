import React, { useState } from 'react'

import { MetaClass } from '/lib/meta'
import { Form2 } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Schema, Type } from './schema'


// const MapSchema = Schema.create(
//     Type.number("Width", 200, {min: 1, max: 256}),
//     Type.number("Height", 150, {min: 1, max: 256}),
// )


// const WorldMapSchema = MapSchema.extend(
//     Type.text("FGColor", '#CCC'),
// )


// class TestMap extends ModelMap {
//     static create(data) {
//         const config = TestMap.parseConfig(data)
//         return new TestMap(config)
//     }

//     constructor(config) {
//         this.width = config.get('width')
//         this.height = config.get('height')
//         this.config = config
//     }
// }


export function TestApp() {
    // const buildItem = () => NamiItem.create({width: 20, height: 10})

    // const [item, setItem] = useState(buildItem())

    // const setConfig = data => {
    //     setItem(buildItem(data))
    // }

    return <section className='TestApp'>
        {/* <Form2
            className="TestForm"
            onSubmit={setConfig}
            onChange={setConfig}
            data={item.data}
        /> */}
    </section>
}