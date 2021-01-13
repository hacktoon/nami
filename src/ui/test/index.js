import React, { useState } from 'react'

import { Schema, Type } from '/lib/schema'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Point } from '/lib/point'
import { Color } from '/lib/color'


export class Test {
    static schema = new Schema(
        Type.number('count', 'Count', 4),
        Type.text('seed', 'Seed', 'seed'),
        Type.boolean('active', 'Active', false),
        Type.color('bg', 'BG color', new Color(230, 35, 66)),
        Type.point('focus', 'Focus', new Point(5, 2)),
    )

    constructor(params) {
    }
}


export function TestUI({model}) {
    const [data, setData] = useState(model.schema.defaultValues())

    const handleSubmit = data => {
        setData(data)
        console.log(data);
    }

    return <section className='TestUI'>
        <button onClick={() => {
            const m = new Map([
                ['seed', 'default'],
                ['bg', new Color(255, 255, 255)],
                ['active', false],
                ['count', 0],
                ['focus', new Point(0, 0)],
            ])
            setData(m)
        }}>click 1</button>
        <button onClick={() => {
            const m = new Map([
                ['seed', 'dois'],
                ['bg', new Color(0, 0, 255)],
                ['active', true],
                ['count', 2],
                ['focus', new Point(2, 2)],
            ])
            setData(m)
        }}>click 2</button>
        <Form
            className="TestForm"
            onSubmit={handleSubmit}
            schema={model.schema}
            data={data}>
            <Button label="New" />
        </Form>
    </section>
}