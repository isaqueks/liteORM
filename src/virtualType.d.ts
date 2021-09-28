export declare type JSPrimaryType = 'number' | 'string' | 'bigint' | 'boolean';
export declare const VTYPE_SIGNATURE = "IS_A_VTYPE";
export declare const VTYPE_SIGNATURE_PROP = "__vtype_signature";
export default abstract class VirtualType<I, O extends number | string | bigint | boolean> {
    static isVirtualType(runtimeObject: any): boolean;
    protected _outputSQLType: string;
    protected _outputJSType: JSPrimaryType;
    protected _inputJSType: string;
    constructor(outSQLType: string, outJSType: JSPrimaryType, inputJSType: string);
    get outputSQLType(): string;
    get outputJSType(): JSPrimaryType;
    get inputJSType(): string;
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
    private checkType;
    handleInput(data: I): O;
    handleOutput(data: O): I | Promise<I>;
}
