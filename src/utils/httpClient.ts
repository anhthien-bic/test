import { HTTP_CLIENT_ERROR_MISSING_CONFIGURE_AUTH } from '@/config/httpClient'
import { ServerSidePropsContext } from '@/types/httpClient'
import { Auth, withSSRContext } from 'aws-amplify'
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



export {
    createHeadersAuth,
    createHeadersJSON,
}
