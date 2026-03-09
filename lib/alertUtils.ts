import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Reusable alert utility using SweetAlert2.
 */
export const Alert = {
    /**
     * Shows a success popup.
     */
    success: (title: string, text?: string): Promise<SweetAlertResult> => {
        return Swal.fire({
            icon: 'success',
            title,
            text,
            background: '#1f2937', // gray-800
            color: '#ffffff',
            confirmButtonColor: '#8b5cf6', // violet-500
        });
    },

    /**
     * Shows an error popup.
     */
    error: (title: string, text?: string): Promise<SweetAlertResult> => {
        return Swal.fire({
            icon: 'error',
            title,
            text,
            background: '#1f2937',
            color: '#ffffff',
            confirmButtonColor: '#ef4444', // red-500
        });
    },

    /**
     * Shows a confirmation dialog (e.g., Yes/No).
     * Returns a promise that resolves to true if confirmed.
     */
    confirm: async (
        title: string,
        text: string,
        confirmButtonText = 'Yes',
        cancelButtonText = 'Cancel'
    ): Promise<boolean> => {
        const result = await Swal.fire({
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            background: '#1f2937',
            color: '#ffffff',
            confirmButtonColor: '#8b5cf6', // violet-500
            cancelButtonColor: '#4b5563', // gray-600
            confirmButtonText,
            cancelButtonText,
            reverseButtons: true,
        });
        return result.isConfirmed;
    },

    /**
     * Custom flexible alert.
     */
    custom: (options: SweetAlertOptions): Promise<SweetAlertResult> => {
        return Swal.fire({
            background: '#1f2937',
            color: '#ffffff',
            ...options,
        });
    },
};
