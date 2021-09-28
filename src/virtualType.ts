export type JSPrimaryType = 'number' | 'string' | 'bigint' | 'boolean';

export const VTYPE_SIGNATURE = 'IS_A_VTYPE';
export const VTYPE_SIGNATURE_PROP = '__vtype_signature';

export default abstract class VirtualType<I, O extends number | string | bigint | boolean> {

    public static isVirtualType(runtimeObject: any) {
        return runtimeObject && typeof runtimeObject === 'object' && runtimeObject[VTYPE_SIGNATURE_PROP] === VTYPE_SIGNATURE;
    }

    protected _outputSQLType: string;
    protected _outputJSType: JSPrimaryType;
    protected _inputJSType: string;

    constructor(outSQLType: string, outJSType: JSPrimaryType, inputJSType: string) {
        this._outputSQLType = outSQLType;
        this._outputJSType = outJSType;
        this._inputJSType = inputJSType;
        this[VTYPE_SIGNATURE_PROP] = VTYPE_SIGNATURE;
    }

    public get outputSQLType() {
        return this._outputSQLType;
    }

    public get outputJSType() {
        return this._outputJSType;
    }

    public get inputJSType() {
        return this._inputJSType;
    }

    /**
     * Transforms input item (JS Object) to an output database item
     * @param data The input item
     */
    protected abstract inputHandler(data: I): O;

    /**
     * Transforms output database item to a JS object item
     * @param data The database item
     */
    protected abstract outputHandler(data: O): I | Promise<I>;


    private checkType(data, expectedType: string) {
        if (typeof data !== expectedType) {
            throw new Error(`Error! Data type should be "${expectedType}". Got "${typeof data}" (${String(data)}).`);
        }
    }

    public handleInput(data: I): O {
        this.checkType(data, this._inputJSType);
        return this.inputHandler(data);
    }

    public handleOutput(data: O): I | Promise<I> {
        this.checkType(data, this._outputJSType);
        return this.outputHandler(data);
    }

}