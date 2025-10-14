import { toast } from 'sonner'

export const showToast = {
    success: (message, description = null) => {
        toast.success(message, {
            description: description,
            duration: 4000,
        })
    },

    error: (message, description = null) => {
        toast.error(message, {
            description: description,
            duration: 5000,
        })
    },

    warning: (message, description = null) => {
        toast.warning(message, {
            description: description,
            duration: 4000,
        })
    },

    info: (message, description = null) => {
        toast.info(message, {
            description: description,
            duration: 3000,
        })
    },

    loading: (message) => {
        return toast.loading(message)
    },

    promise: (promise, messages) => {
        return toast.promise(promise, messages)
    }
}

export default showToast
