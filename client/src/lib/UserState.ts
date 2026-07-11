import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
    isloggedin: boolean;
    name: string;
    role: string;
    image: string;
    id: string;
}

type Action = {
    setLogin: (user: State) => void;
    setLogout: () => void;
}

const userState = (set) => {
    let userObject = {
        isloggedin: false,
        name: "",
        role: "",
        image: "",
        id: "",
        setLogin: (user) => {
            return set(() => {
                return {
                    isloggedin: true,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                    id: user.id,
                }
            })
        },
        setLogout: () => {
            return set(() => {
                return {
                    isloggedin: false,
                    name: "",
                    role: "",
                    image: "",
                    id: "",
                }
            })
        }
    }
    return userObject;
}

const useUser = create<State & Action>()(persist(userState, {
    name: "user-storage"
}));

export default useUser;