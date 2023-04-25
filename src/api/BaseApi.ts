import { AxiosSingleton, createHeadersAuth, createHeadersJSON } from '@/utils/httpClient'
import {
    AxiosInstance,
    AxiosRequestConfig,
} from 'axios'
import _, { get } from 'lodash'
import { ParseParams, ZodError } from 'zod'

import { ServerSidePropsContext } from '../types/httpClient'

export interface ApiConfig {
    baseURL?: string
    url?: string
    headers?: any
    withCredentials?: boolean
    timeout?: number
}

interface HttpClientRequestConfig extends AxiosRequestConfig {
    withErrorHandle?: boolean
    noAuth?: boolean
    fieldName?: string
    validator?: (data: unknown, params?: Partial<ParseParams>) => Promise<any>
    ctx?: ServerSidePropsContext
}


export default class BaseApi {
    config: ApiConfig
    api: AxiosInstance

    constructor(config: ApiConfig) {
        this.config = { timeout: 5000, baseURL: '', url: '', ...config }
        this.config.headers = { ...(this.config.headers || {}), ...createHeadersJSON() }
        this.api = AxiosSingleton.getInstance()
    }

    async do({
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
                ...this.config,
                headers: {
                    ...this.config.headers,
                    ...(noAuth ? {} : headersAuth),
                    ...headers,
                },
                ...rest,
            })

            const response = validator
                ? await validator(axiosResponse)
                : axiosResponse

            return fieldName ? get(response, fieldName) : response
        } catch (error: any) {
            if (error instanceof ZodError) {
                // eslint-disable-next-line no-console
                console.log('[DEBUG] Zod error at request 1', rest.url, error)
            }
            return Promise.reject(error)
        }
    }

    doGet(config?: HttpClientRequestConfig) {
        return this.do({ ...(config || {}), method: 'GET' })
    }

    doPost(config?: HttpClientRequestConfig) {
        return this.do({ ...(config || {}), method: 'POST' })
    }

    doPut(config?: HttpClientRequestConfig) {
        return this.do({ ...(config || {}), method: 'PUT' })
    }

    doDelete(config?: HttpClientRequestConfig) {
        return this.do({ ...(config || {}), method: 'DELETE' })
    }

    get(config?: HttpClientRequestConfig) {
        return this.doGet({ ...(config || {}), url: this.config.url })
    }

    getDetail(id: string | number, config?: HttpClientRequestConfig) {
        return this.doGet({ ...(config || {}), url: `${this.config.url}/${id}`, })
    }

    post(config?: HttpClientRequestConfig) {
        return this.doPost({ ...(config || {}), url: this.config.url })
    }

    put(id: string | number, config?: HttpClientRequestConfig) {
        return this.doPut({ ...(config || {}), url: `${this.config.url}/${id}` })
    }

    delete(id: string | number, config?: HttpClientRequestConfig) {
        return this.doDelete({ ...(config || {}), url: `${this.config.url}/${id}` })
    }

    destroy(id: string | number, config?: HttpClientRequestConfig) {
        return this.doDelete({ ...(config || {}), url: `${this.config.url}/destroy/${id}` })
    }

    deletes(config?: HttpClientRequestConfig) {
        return this.doDelete({ ...(config || {}), url: `${this.config.url}/deletes` })
    }

    detroys(config?: HttpClientRequestConfig) {
        return this.doDelete({ ...(config || {}), url: `${this.config.url}/detroys` })
    }
}
