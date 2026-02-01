export interface StoreType {
    theme : string;
    authenticated : boolean;
    userDetails : any;
    workspace : any;
}

export interface Action{
    type: any;
    payload: any;
}

export interface StoreContextType {
    state : StoreType;
    dispatch: React.Dispatch<Action>
}