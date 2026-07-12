import { useLocation } from "react-router-dom";
export const UpdateProfile: React.FC = () => {
    const location = useLocation();
    const { profileData } = location.state;
    console.log("Profile data from update profile ", profileData);

    return (
        <>
            <h1>Update profile </h1>
        </>
    )
}