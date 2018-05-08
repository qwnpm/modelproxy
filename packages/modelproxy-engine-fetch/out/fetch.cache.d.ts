import { IExecute } from "modelproxy/out/models/execute";
/**
 * 为fetch增加cache的功能
 * 返回新的promise
 * @param fetchPromise {Promise<any>} fetch的promise
 * @param options      {IExecute}     请求参数
 * @param fullPath     {string}       请求路径
 * @returns {Promise<any>}
 */
export declare const fetchCacheDec: (fetchPromise: () => Promise<any>, options: IExecute, fullPath: string) => Promise<any>;
