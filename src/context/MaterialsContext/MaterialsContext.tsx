import React, { createContext, useContext, useState } from 'react';
import { SelectedMaterial } from '../../screens/Orders/WorkOrderMaterialsScreen';

interface MaterialsState {
    orderId: number | null;
    orderName: string;
    materials: SelectedMaterial[];
}

interface MaterialsContextType {
    state: MaterialsState;
    setMaterials: (orderId: number, orderName: string, materials: SelectedMaterial[]) => void;
    clearMaterials: () => void;
    hasPendingMaterials: boolean;
    isFromDifferentOrder: (orderId: number) => boolean;
}

const MaterialsContext = createContext<MaterialsContextType | null>(null);

const INITIAL_STATE: MaterialsState = {
    orderId: null,
    orderName: '',
    materials: [],
};

export const MaterialsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<MaterialsState>(INITIAL_STATE);

    const setMaterials = (orderId: number, orderName: string, materials: SelectedMaterial[]) => {
        setState({ orderId, orderName, materials });
    };

    const clearMaterials = () => setState(INITIAL_STATE);

    const hasPendingMaterials = state.materials.length > 0;

    const isFromDifferentOrder = (orderId: number) =>
        hasPendingMaterials && state.orderId !== orderId;

    return (
        <MaterialsContext.Provider value={{
            state,
            setMaterials,
            clearMaterials,
            hasPendingMaterials,
            isFromDifferentOrder,
        }}>
            {children}
        </MaterialsContext.Provider>
    );
};

export const useMaterials = () => {
    const ctx = useContext(MaterialsContext);
    if (!ctx) throw new Error('useMaterials debe usarse dentro de MaterialsProvider');
    return ctx;
};