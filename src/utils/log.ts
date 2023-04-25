import { captureMessage } from '@sentry/nextjs'

const logError = (page: string, message: string, error: any) => {
    captureMessage(
        JSON.stringify({
            category: 'bic-error',
            message: `At ${page}, an error has been occurred: ${message}. \nError: ${error}`,
            level: 'debug',
        })
    )
}

export { logError }
