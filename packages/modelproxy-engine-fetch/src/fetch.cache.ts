
import { BaseFactory } from "modelproxy";
import { IExecute } from "modelproxy/out/models/execute";

const promiseFactory = new BaseFactory<Promise<any>>();

/**
 * 为fetch增加cache的功能
 * 返回新的promise
 * @param fetchPromise {Promise<any>} fetch的promise
 * @param options      {IExecute}     请求参数
 * @param fullPath     {string}       请求路径
 * @returns {Promise<any>}
 */
export const fetchCacheDec = (fetchPromise: () => Promise<any>, options: IExecute, fullPath: string) => {
    const { cache = false } = options.settings || {},
        { method = "" } = options.instance || {},
        proKey = fullPath + method;

    if (!cache) {
        return fetchPromise();
    }

    const promiseInCache = promiseFactory.get(proKey);

    if (promiseInCache) {
        return promiseInCache;
    }

    promiseFactory.add(proKey, fetchPromise());

    return promiseFactory.get(proKey) as Promise<any>;
};
