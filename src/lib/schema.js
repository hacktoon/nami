
export class Schema {
    constructor(spec) {
        this.fields = spec
    }

    get defaults() {
        return Object.fromEntries(this.fields.map(
            field => [field.name, field.value]
        ))
    }
}
