
export class Schema {
    constructor(spec) {
        this.fields = buildFields(spec)
    }

    get defaultConfig() {
        return Object.fromEntries(this.fields.map(
            field => [field.name, field.value]
        ))
    }
}


function buildFields(spec) {
    return spec.map(({sanitize, ...field}) => {
        return {...field}
    })
}