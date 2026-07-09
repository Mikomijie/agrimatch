import { toast } from 'react-toastify'

export const notify = {
  success: (message) => toast.success(message, { position: 'bottom-right' }),
  error: (message) => toast.error(message, { position: 'bottom-right' }),
  info: (message) => toast.info(message, { position: 'bottom-right' }),
  warning: (message) => toast.warning(message, { position: 'bottom-right' }),
}