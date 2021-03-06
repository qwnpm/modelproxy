import { IExecute } from "../models/execute";
import { IEngine } from "../models/engine";
import { IInterfaceModel, IInterfaceModelCommon } from "../models/interface";
import { IProxyConfig } from "../models/proxy.config";
import { InterfaceFactory } from "./interface.factory";
import { engineFactory } from "./engine.factory";
// import { ComposeFactory } from "./compose.factory";
import { Compose } from "./compose";
import { ModelProxyMissingError } from "./errors";

// import * as cproxy from "./cproxy";


export type NormalExecuteInfo = { ns?: string, key?: string, options?: IExecute };

export class ModelProxy extends Compose<any> {
    private interfaces: { [id: string]: InterfaceFactory; } = {};
    // private cproxy: cproxy.ModelProxy.ComposeProxy = new cproxy.ModelProxy.ComposeProxy();
    // private composes: { [id: string]: ComposeFactory; } = {};

    /**
     * 添加engines
     * @param   { { [id: string]: IEngine; } } engines   引擎对象
     * @returns {ModelProxy}
     */
    public addEngines(engines: { [id: string]: IEngine; }): ModelProxy {
        for (let key in engines) {
            if (engines.hasOwnProperty(key)) {
                engineFactory.add(key, engines[key], true);
            }
        }

        return this;
    }
    /**
     * 导入配置
     * @param  {IProxyConfig}            config                    配置信息
     * @param  {overrideInterfaceConfig} overrideInterfaceConfig   覆盖的参数
     * @return {ModelProxy}                                        当前实例
    */
    public loadConfig(config: IProxyConfig, overrideInterfaceConfig: IInterfaceModelCommon): ModelProxy {
        this.interfaces[config.key as string] = this.initInterfaces(config, overrideInterfaceConfig);

        return this;
    }

    /**
     * 执行一个接口方法
     * @param   {String}    ns       接口的命名空间
     * @param   {String}    key      接口的key
     * @param   {IExecute}  options  调用接口所需的参数
     * @returns {Promise<any>}
     */
    public async execute(ns: string, key: string, options: IExecute = {}) {
        const interfaces = this.getNs(ns),
            instance = interfaces.get(key);

        if (!instance) {
            throw new ModelProxyMissingError(`没有发现/${ns}/${key}的接口方法！`);
        }

        return instance.execute(options);
    }

    /**
     * 执行多个接口请求
     * @param   {{ [key: string]: () => Promise<any> }} inters 接口以key:value的形式
     * @returns {Promise<any>}
     * @example
     *  proxy.executeAll({
     *      a: proxy.execute.bind(proxy, nsA, keyA, {}),
     *      b: proxy.execute.bind(proxy, nsB, keyB, {})
     *  });
     */
    public async executeAll(inters: { [key: string]: () => Promise<any> }): Promise<any> {
        const maps: Promise<any>[] = [];

        // 如果没有配置inters，则直接返回null
        if (!inters || !Object.keys(inters).length) {
            return new Promise((resolve: (val: any | PromiseLike<any>) => void) => {
                resolve(null);
            });
        }

        Object.keys(inters).forEach((key: string) => {
            maps.push(inters[key]().then((data: any) => {
                return {
                    [key]: data
                };
            }));
        });

        return Promise.all(maps).then((data: any[]) => {
            return data.reduce((prev: any, next: any) => {
                return Object.assign({}, prev, next);
            });
        });
    }

    /**
     * race 比赛，快的先返回
     * @param   {Array<NormalExecuteInfo | Promise<any>>}  inters 接口们
     * @returns {Promise<any>}
     */
    public async race(inters: Array<NormalExecuteInfo | Promise<any>>): Promise<any> {
        const maps: any[] = inters.map((inter: NormalExecuteInfo | Promise<any>) => {
            if ((inter as Promise<any>).then) {
                return inter;
            }
            const { ns = "", key = "", options = {} } = inter as NormalExecuteInfo;

            return this.execute(ns, key, options);
        });

        return Promise.race(maps);
    }

    /**
     * 获取namespace
     * @param  {string}             ns     空间名
     * @return { InterfaceFactory }
     */
    public getNs(ns: string): InterfaceFactory {
        if (!this.interfaces.hasOwnProperty(ns)) {
            let nses = [];

            for (let key in this.interfaces) {
                if (this.interfaces.hasOwnProperty(key)) {
                    let element = this.interfaces[key];
                    nses.push(key);
                }
            }

            throw new ModelProxyMissingError(`没有找到${ns}空间;当前命名空间【${nses.join(",")}】`);
        }

        return this.interfaces[ns];
    }

    /**
     * 生成N级的rest风格接口
     * @param   {string}   ns    命名空间
     * @param   {string[]} keys  需要合并的接口的key
     * @returns {(...ids: any[]) : IInterfaceModel}
     * @example
     *     proxy.minix("test","users","articles")(1000).get(10) => GET /users/1000/articles/10
     */
    public minix(ns: string, ...keys: string[]): ((...ids: any[]) => IInterfaceModel) | null {
        if (!keys.length) {
            throw new ModelProxyMissingError(`必须制定至少一个Key！`);
        }

        const interfaces = this.getNs(ns),
            idKeys: IInterfaceModel[] = [],
            lastKey: string = keys.pop() as string,
            lastInterface = interfaces.get(lastKey);

        if (!lastInterface) {
            return null;
        }

        keys.forEach((k: string) => {
            let instance = interfaces.get(k);

            if (!instance) {
                throw new ModelProxyMissingError(`${k}不存在于空间${ns}！`);
            }

            idKeys.push(instance);
        });

        return (...ids: any[]) => {
            if (ids.length !== idKeys.length) {
                throw new Error(`传入的参数个数不正确！`);
            }

            let paths: string[] = [];

            idKeys.forEach((k: IInterfaceModel, idx: number) => {
                paths.push(k.replacePath({
                    instance: {
                        path: k.path + "/:" + k.key
                    },
                    params: {
                        [k.key as string]: ids[idx]
                    }
                }));
            });

            lastInterface.path = paths.concat([lastInterface.path as string]).join("");

            return lastInterface;
        };
    }

    /**
     * 初始化配置文件中的接口信息
     * @param   {IProxyConfig}      config  配置信息
     * @returns {InterfaceFactory}
     */
    private initInterfaces(config: IProxyConfig, overrideInterfaceConfig: IInterfaceModelCommon = {}): InterfaceFactory {
        let ifFactory = new InterfaceFactory();

        config.interfaces.forEach((i: IInterfaceModelCommon) => {
            ifFactory.add(i.key as string, Object.assign({}, {
                engine: config.engine,
                mockDir: config.mockDir,
                ns: config.key,
                state: config.state,
                states: config.states,
            }, i, overrideInterfaceConfig || {}) as IInterfaceModel);
        });

        return ifFactory;
    }
}
