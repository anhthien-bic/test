import { localStorageKeys } from '@/config/common'
import { HTTP_CLIENT_ERROR_MISSING_CONFIGURE_AUTH, HTTP_CLIENT_ERROR_NO_RESPONSE, HTTP_CLIENT_ERROR_UNEXPECTED, HTTP_ERROR_CODE_MAINTENANCE, HTTP_ERROR_CODE_UNAUTHORIZED } from '@/config/httpClient'
import { ServerSidePropsContext } from '@/types/httpClient'
import { Auth, withSSRContext } from 'aws-amplify'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { get } from 'lodash'
import { GetServerSidePropsContext } from 'next'

import { logError } from './log'

const createHeadersJSON = () => {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    }
}

const getCurrentUser = async (ctx?: GetServerSidePropsContext) => {
    if (!ctx) {
        return Auth.currentAuthenticatedUser()
    }

    const SSR = withSSRContext(ctx)
    return SSR.Auth.currentAuthenticatedUser()
}

const getToken = async (ctx?: ServerSidePropsContext): Promise<string> => {
    const currentUser = await getCurrentUser(ctx)
    return currentUser.signInUserSession.idToken.jwtToken
}

const createHeadersAuth = async (ctx?: ServerSidePropsContext) => {
    try {
        const token = await getToken(ctx)
        return {
            Authorization: token,
        }
    } catch (e) {
        logError('createHeadersAuth', '', e)
        throw new Error(HTTP_CLIENT_ERROR_MISSING_CONFIGURE_AUTH)
    }
}

const handleErrorResponse = async (error: AxiosError) => {
    const isClient = typeof document !== 'undefined'
    if (error.response) {
        if (
            get(error, 'response.data.code') === HTTP_ERROR_CODE_MAINTENANCE &&
            isClient
        ) {
            // save maintenance data to local storage
            localStorage.setItem(
                localStorageKeys.MAINTENANCE,
                JSON.stringify(get(error, 'response.data.data'))
            )
            return Promise.reject(HTTP_ERROR_CODE_MAINTENANCE)
        }
        // remove local maintenance when server is back to normal
        localStorage.removeItem(localStorageKeys.MAINTENANCE)
        if (
            error.response.status === HTTP_ERROR_CODE_UNAUTHORIZED &&
            isClient
        ) {
            return Promise.reject(HTTP_ERROR_CODE_UNAUTHORIZED)
        }
        // @ts-ignore
        return error.config.withErrorHandle
            ? error.response.data
            : Promise.reject(new Error(`${get(error, 'response.data.meta.message')}`))
    }
    
    if (error.request) {
        return Promise.reject(new Error(HTTP_CLIENT_ERROR_NO_RESPONSE)) // system issue, mainly because of internet connection
    }
    
    return Promise.reject(new Error(HTTP_CLIENT_ERROR_UNEXPECTED)) // 600, unexpected error from server
}

const AxiosSingleton = (function () {
    var axiosInstance: AxiosInstance;

    function createInstance() {
        const instance = axios.create()
        instance.interceptors.response.use((response: AxiosResponse) => {
            return response.data
        }, handleErrorResponse)

        return instance
    }

    return {
        getInstance: function () {
            if (!axiosInstance) {
                axiosInstance = createInstance();
            }
            return axiosInstance;
        }
    };
})();

export {
    createHeadersAuth,
    createHeadersJSON,
    AxiosSingleton
}
