import { camelCase, upperCaseFirst } from "change-case";
import doAsync from "./async-util";

interface IAsyncType {
    BASE: string;
    SUCCESS: string;
    FAILURE: string;
    PENDING: string;
    loadingKey: string;
    statusCode: string;
    stateKey: string;
}

type ActionFunc = (store, payload: IAsyncActionPayload) => any;

type DataCallbackFunc = (data: object, state: object) => object;
type SuccessCallbackFunc = (data: object) => any;
type ErrorCallbackFunc = (error: any) => any;

interface IAsyncActionPayload {
    axiosConfig: object;
    dataCallback: DataCallbackFunc;
    successCallback: SuccessCallbackFunc;
    errorCallback: ErrorCallbackFunc;
}

const createAsyncType = (typeName: string): IAsyncType => {
    return {
        BASE: `${typeName}`,
        FAILURE: `${typeName}_FAILURE`,
        PENDING: `${typeName}_PENDING`,
        SUCCESS: `${typeName}_SUCCESS`,
        loadingKey: `pending`,
        stateKey: `data`,
        statusCode: `statusCode`,
    };
};

const createMutations = (type: IAsyncType) => {
    const mutations: any = {};
    mutations[type.BASE] = (state, payload) => {
        switch (payload.type) {
            case type.PENDING:
                // return Vue.set(state, TYPE.loadingKey, payload.value);
                return state[type.loadingKey] = payload.value;

            case type.SUCCESS:
                // Vue.set(state, TYPE.statusCode, payload.statusCode);
                // return Vue.set(state, TYPE.stateKey, payload.data);
                state[type.statusCode] = payload.statusCode;
                return state[type.stateKey] = payload.data;

            case type.FAILURE:
                // Vue.set(state, TYPE.statusCode, payload.statusCode);
                // return Vue.set(state, TYPE.stateKey, null);
                state[type.statusCode] = payload.statusCode;
                return state[type.stateKey] = null;
        }
    };
    return mutations;
};

const createGetters = (name: string) => {
    const getters: any = {};
    getters[camelCase(name)] = (state) => {
        return {
            data: state.data,
            pending: state.pending,
            statusCode: state.statusCode,
        };
    };
    return getters;
};

const createActions = (name: string, type: IAsyncType) => {
    const actions: any = {};
    const action: ActionFunc = (store, payload: IAsyncActionPayload) => {
        const { axiosConfig, dataCallback, successCallback, errorCallback } = payload;
        return doAsync(
            store, {
            axiosConfig,
            dataCallback,
            errorCallback,
            mutationTypes: type,
            successCallback,
        });
    };

    actions[camelCase(`get${name}Async`)] = action;
    return actions;
};

export const createVuexAsyncModule = (name: string) => {
    const Name = upperCaseFirst(name);
    const TYPE: IAsyncType = createAsyncType(`GET_${Name.toUpperCase()}_ASYNC`);
    return {
        actions: createActions(Name, TYPE),
        getters: createGetters(Name),
        mutations: createMutations(TYPE),
        state: {
            data: null,
            pending: false,
            statusCode: 0,
        },
    };
};
