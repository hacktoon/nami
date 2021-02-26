import React, { useState } from 'react'

import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Point } from '/lib/base/point'
import { Color } from '/lib/base/color'


export function TestAppUI({model}) {
    const [data, setData] = useState(model.schema.parse())

    const handleSubmit = data => {
        setData(data)
    }

    return <section className='TestAppUI'>
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
            data={data}>
            <Button label="New" />
        </Form>
    </section>
}


export class TestApp {
    static ui = TestAppUI
    static id = 'Test'
    static schema = new Schema(
        Type.number('count', 'Count', {default: 4}),
        Type.text('seed', 'Seed', {default: 'seed'}),
        Type.boolean('active', 'Active', {default: false}),
        Type.color('bg', 'BG color', {default: new Color(230, 35, 66)}),
        Type.point('focus', 'Focus', {default: new Point(5, 2)}),
    )

    constructor(params) {
    }
}
