import { useEffect, useState } from 'react'

const useWindowFocus = () => {
    const hasFocus = () =>
        typeof document !== 'undefined' && document.hasFocus()
    const [focused, setFocused] = useState(hasFocus) // Focus for first render

    useEffect(() => {
        setFocused(hasFocus()) // Focus for additional renders

        const onFocus = () => setFocused(true)
        const onBlur = () => setFocused(false)

        window.addEventListener('focus', onFocus)
        window.addEventListener('blur', onBlur)

        return () => {
            window.removeEventListener('focus', onFocus)
            window.removeEventListener('blur', onBlur)
        }
    }, [])

    return focused
}

export { useWindowFocus }
