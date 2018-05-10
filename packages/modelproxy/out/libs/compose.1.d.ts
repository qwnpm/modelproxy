import { IProxyCtx } from '../models/proxyctx';
export interface MiddleFunc {
    (ctx: IProxyCtx, next: (symbol?: string) => void): void;
}
export interface MiddleRtnFunc {
    (ctx?: IProxyCtx): void;
}
export declare class Compose<T extends IProxyCtx> {
    private middlewares;
    constructor();
    use(func: MiddleFunc): void;
    clear(): void;
    compose(): Function;
    errorHandle(ctx: T, err: Error): void;
    callback(complete?: MiddleRtnFunc): (options: any) => Promise<IProxyCtx>;
}
