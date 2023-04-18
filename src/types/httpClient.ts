import { CognitoUser } from 'amazon-cognito-identity-js'
import { GetServerSidePropsContext } from 'next'

export interface ServerSidePropsContext extends GetServerSidePropsContext {
    locale: string
    user: CognitoUser
}
