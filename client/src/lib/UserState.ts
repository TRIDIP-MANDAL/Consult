import { create } from 'zustand';

type State = {
    isloggedin: boolean;
    name: string;
    role: string;
    image: string | null;
    id: string;
    profession_category: string | null;
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
        profession_category: "",
        setLogin: (user) => {
            return set(() => {
                return {
                    isloggedin: user.isloggedin !== undefined ? user.isloggedin : true,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                    id: user.id,
                    profession_category: user.profession_category ?? null,
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
                    profession_category: null,
                }
            })
        }
    }
    return userObject;
}

const useUser = create<State & Action>()(userState);

export default useUser;
