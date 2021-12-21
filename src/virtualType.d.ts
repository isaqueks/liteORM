export declare const VTYPE_SIGNATURE = "IS_A_VTYPE";
export declare const VTYPE_SIGNATURE_PROP = "__vtype_signature";
export declare type JSType = 'string' | 'number' | 'boolean' | 'object' | 'function' | 'symbol' | 'undefined' | 'any';
export default abstract class VirtualType<I, O> {
    static isVirtualType(runtimeObject: any): boolean;
    protected _outputSQLType: string;
    protected _outputJSType: string;
    protected _inputJSType: string;
    constructor(outSQLType: string, outJSType: string, inputJSType: string);
    get outputSQLType(): string;
    get outputJSType(): string;
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
