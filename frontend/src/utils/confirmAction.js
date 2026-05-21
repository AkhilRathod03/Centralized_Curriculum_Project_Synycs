import React from 'react';
import { toast } from 'react-toastify';

export const confirmAction = (message) => {
    return new Promise((resolve) => {
        const id = toast.warn(
            <div>
                <p className='mb-2 fw-bold text-dark small'>{message}</p>
                <div className='d-flex gap-2 justify-content-end mt-3'>
                    <button className='btn btn-sm btn-light border rounded-pill px-3 fw-bold' onClick={() => { toast.dismiss(id); resolve(false); }}>Cancel</button>
                    <button className='btn btn-sm btn-danger rounded-pill px-3 fw-bold' onClick={() => { toast.dismiss(id); resolve(true); }}>Confirm Action</button>
                </div>
            </div>,
            { autoClose: false, closeOnClick: false, draggable: false, closeButton: false }
        );
    });
};