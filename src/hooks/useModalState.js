// Global modal state hook - tracks when any modal is open
import { useState, useCallback, useEffect } from 'react';

let modalCount = 0;
const listeners = new Set();

const notifyListeners = () => {
    listeners.forEach(listener => listener(modalCount > 0));
};

export const useModalState = () => {
    const [isModalOpen, setIsModalOpen] = useState(modalCount > 0);

    useEffect(() => {
        const listener = (hasModals) => setIsModalOpen(hasModals);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    const openModal = useCallback(() => {
        modalCount++;
        notifyListeners();
    }, []);

    const closeModal = useCallback(() => {
        modalCount = Math.max(0, modalCount - 1);
        notifyListeners();
    }, []);

    return { isModalOpen, openModal, closeModal };
};

