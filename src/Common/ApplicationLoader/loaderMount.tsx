import {createRoot} from 'react-dom/client';
import ApplicatonLoader from './ApplicationLoader';

let isMounted = false;
let root: ReturnType<typeof createRoot> | null = null;

export const mountLoader = () => {
    if(isMounted) return;

    const container = document.getElementById("global-app-loader");
    if(!container) return;

    if(!root){
        root = createRoot(container);
        root.render(<ApplicatonLoader />);
    }

    isMounted = true;

}