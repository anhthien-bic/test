import { createHeadersAuth, createHeadersJSON } from '@/utils/httpClient'
import { logError } from '@/utils/log'
import axios, {
    AxiosResponse,
    AxiosInstance,
    AxiosError,
    AxiosRequestConfig,
} from 'axios'
import _ from 'lodash'
import { ParseParams, ZodError } from 'zod'

import {
    HTTP_ERROR_CODE_UNAUTHORIZED,
    HTTP_CLIENT_ERROR_NO_RESPONSE,
    HTTP_CLIENT_ERROR_UNEXPECTED,
    HTTP_CLIENT_ERROR_MISSING_CONFIGURE_AUTH,
    EVENT_KICK_OUT
} from '../config/httpClient'
import { ServerSidePropsContext } from '../types/httpClient'

const handleErrorResponse = async (error: AxiosError) => {
    if (error.response) {
        if (
            error.response.status === HTTP_ERROR_CODE_UNAUTHORIZED &&
            typeof document !== 'undefined'
        ) {
            document.dispatchEvent(new Event(EVENT_KICK_OUT))
        }
        // @ts-ignore
        return error.config.withErrorHandle
            ? error.response.data
            : Promise.reject(new Error(`${error.response.data?.meta?.message}`))
    }
    if (error.request) {
        logError('httpClient', 'request error', error)
        return Promise.reject(new Error(HTTP_CLIENT_ERROR_NO_RESPONSE)) // system issue, mainly because of internet connection
    }
    logError('httpClient', 'unexpected error', error)
    return Promise.reject(new Error(HTTP_CLIENT_ERROR_UNEXPECTED)) // 600, unexpected error from server
}

export interface ApiConfig {
    baseURL?: string
    url?: string
    headers?: any
    withCredentials?: boolean
    timeout?: number
    setResponse?: Function
    setError?: Function
}

interface HttpClientRequestConfig extends AxiosRequestConfig {
    withErrorHandle?: boolean
    noAuth?: boolean
    fieldName?: string
    validator?: (data: unknown, params?: Partial<ParseParams>) => Promise<any>
    ctx?: ServerSidePropsContext
}

export default class BaseApi {
    api: AxiosInstance

    url: string
    baseURL:string

    headers?: any

    constructor({
        baseURL = process.env.apiUrl,
        url,
        headers = {},
        timeout = 5000,
        setResponse,
        withCredentials,
    }: ApiConfig) {
        this.baseURL = baseURL || ""
        this.url = url || ""

        this.headers = { ...headers, ...createHeadersJSON() }
        this.api = axios.create({
            baseURL,
            timeout,
            withCredentials,
        })

        this.api.interceptors.response.use((response: AxiosResponse) => {
            return setResponse ? setResponse(response) : response.data
        }, handleErrorResponse)
    }

    async do({
        url,
        method,
        params,
        data,
        headers,
        ctx,
        validator,
        noAuth = false,
        fieldName,
        ...rest
    }: HttpClientRequestConfig) {
        try {
            const headersAuth = ctx?.user
                ? {
                      Authorization:
                          // @ts-ignore
                          ctx.user.signInUserSession.idToken.jwtToken,
                  }
                : await createHeadersAuth()

            const axiosResponse = await this.api({
                method,
                url,
                params,
                data,
                headers: {
                    ...this.headers,
                    ...(noAuth ? {} : headersAuth),
                    ...headers,
                },
                ...rest,
            })

            const response = validator
                ? await validator(axiosResponse)
                : axiosResponse

            return fieldName ? _.get(response, fieldName) : response
        } catch (error: any) {
            if (
                error?.message === HTTP_CLIENT_ERROR_MISSING_CONFIGURE_AUTH &&
                typeof document !== 'undefined'
            ) {
                document.dispatchEvent(new Event(EVENT_KICK_OUT))
            }
            if (error instanceof ZodError) {
                logError(
                    String(url),
                    'Http client unexpected response type: ',
                    error
                )
            }
            return Promise.reject(error)
        }
    }

    doGet(config?: HttpClientRequestConfig) {
        return this.do({ ...config, method: 'GET' })
    }

    doPost(config?: HttpClientRequestConfig) {
        return this.do({ ...config, method: 'POST' })
    }

    doPut(config?: HttpClientRequestConfig) {
        return this.do({ ...config, method: 'PUT' })
    }

    doDelete(config?: HttpClientRequestConfig) {
        return this.do({ ...config, method: 'DELETE' })
    }

    get(config?: HttpClientRequestConfig) {
        return this.doGet({ method: 'get', url: this.url, ...config })
    }

    getDetail(id: string | number, config?: HttpClientRequestConfig) {
        return this.doGet({ url: `${this.url}/${id}`, ...config })
    }

    post(config?: HttpClientRequestConfig) {
        return this.doPost({ url: this.url, ...config })
    }

    put(id: string | number, config?: HttpClientRequestConfig) {
        return this.doPut({ url: `${this.url}/${id}`, ...config })
    }

    delete(id: string | number, config?: HttpClientRequestConfig) {
        return this.doDelete({ ...config, url: `${this.url}/${id}` })
    }

    destroy(id: string | number, config?: HttpClientRequestConfig) {
        return this.doDelete({ url: `${this.url}/destroy/${id}`, ...config })
    }

    deletes(config?: HttpClientRequestConfig) {
        return this.doDelete({
            method: 'delete',
            url: `${this.url}/deletes`,
            ...config,
        })
    }

    detroys(config?: HttpClientRequestConfig) {
        return this.doDelete({ url: `${this.url}/detroys`, ...config })
    }
}
