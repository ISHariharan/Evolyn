export interface StoreType {
    theme : string;
}

export interface Action{
    type: string;
    payload: string;
}

export interface StoreContextType {
    state : StoreType;
    dispatch: React.Dispatch<Action>
}