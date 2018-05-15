import { BaseEngine } from "modelproxy";
import { IInterfaceModel } from "modelproxy/out/models/interface";
import { IExecute } from "modelproxy/out/models/execute";
export declare class FetchEngine extends BaseEngine {
    /**
     * 初始化中间件
     * 处理参数params，data，header等数据
     */
    init(): void;
    /**
     * 调用接口代理方法
     * @param   {IInterfaceModel} instance 接口的信息
     * @param   {IExecute}        options  调用接口的参数
     * @returns {Promise<any>}             返回数据
     */
    proxy(instance: IInterfaceModel, options: IExecute): Promise<any>;
}
