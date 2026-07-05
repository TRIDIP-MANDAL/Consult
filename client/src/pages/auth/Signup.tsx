import { useState } from "react";
import countryList from "country-list";
import { professionCategories } from "../../assets/data/profession.json";
import { currencies } from "../../assets/data/currency.json";
import OtpVerification from "../../component/cards/OtpVerification.tsx";

interface UserForm {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    dob: string;
    gender: string;
    role: "USER" | "MENTOR";
    profession: string;
    profession_category: string;
    country: string;
    postal_code: string;
}

interface MentorForm {
    experience: string;
    about: string;
    available_from: string;
    available_to: string;
    charge: string;
    currency: string;
    achievements: string;
}

interface CombinedForm {
    user: UserForm
    mentor?: MentorForm
}

export const Signup: React.FC = () => {
    const [userForm, setUserForm] = useState<UserForm>({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        dob: "",
        gender: "",
        role: "USER",
        profession: "",
        profession_category: "",
        country: "",
        postal_code: "",
    });

    const [mentorForm, setMentorForm] = useState<MentorForm>({
        experience: "",
        about: "",
        available_from: "",
        available_to: "",
        charge: "",
        currency:"",
        achievements: "",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [prfsn, setPrfsn] = useState<string>("");
    const [otpVerified, setOtpVerified] = useState<boolean>(false);
    const [professions, setProfessions] = useState<Array<string>>([]);
    const isMentor = userForm.role === "MENTOR";

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
        if (name === "profession_category") {
            setProfessions(professionCategories[value]);
        }
    };

    const handleMentorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMentorForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // if (!otpVerified) {
        //     setError("Please verify your email");
        //     return;
        // }
        if (mentorForm.charge && !mentorForm.currency){
            setError("Please select currency to accept credit");
            return;
        }
        userForm.profession = userForm.profession === "Other" ? prfsn : userForm.profession;
        const body: CombinedForm = { user: userForm };
        if (isMentor) body.mentor = mentorForm;

        console.log("Whoel form data ", body)
        // TODO: hit POST /auth/signup with callApi
        // reset logic after api success 
        setError("");


    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Sign Up</h1>
            {/* ── ROLE TOGGLE ── */}
            <fieldset>
                <legend>I am signing up as:</legend>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="USER"
                        checked={userForm.role === "USER"}
                        onChange={handleUserChange}
                    />
                    User
                </label>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="MENTOR"
                        checked={userForm.role === "MENTOR"}
                        onChange={handleUserChange}
                    />
                    Mentor
                </label>
            </fieldset>

            {/* ── BASIC INFO ── */}
            <fieldset>
                <legend>Personal Information</legend>

                <label>First Name *
                    <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserChange} required />
                </label>

                <label>Middle Name
                    <input type="text" name="middle_name" value={userForm.middle_name} onChange={handleUserChange} />
                </label>

                <label>Last Name *
                    <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserChange} required />
                </label>

                <label>Date of Birth
                    <input type="date" name="dob" value={userForm.dob} onChange={handleUserChange} />
                </label>

                <label>Gender
                    <select name="gender" value={userForm.gender} onChange={handleUserChange}>
                        <option value="">Select</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>
            </fieldset>

            {/* ── CONTACT & AUTH ── */}
            <fieldset>
                <legend>Account Details</legend>

                <label>Email *
                    <input type="email" name="email" value={userForm.email} onChange={handleUserChange} required />
                </label>
                <OtpVerification email={userForm.email} onVerified={setOtpVerified} />
                <label>Phone *
                    <input type="tel" name="phone" value={userForm.phone} onChange={handleUserChange} required />
                </label>

                <label>Password *
                    <input type="password" name="password" value={userForm.password} onChange={handleUserChange} required />
                </label>
            </fieldset>

            {/* ── PROFESSION ── */}
            <fieldset>
                <legend>Profession</legend>
                <label>Category
                    <select name="profession_category" value={userForm.profession_category} onChange={handleUserChange}>
                        <option value="">Select Category</option>
                        {Object.keys(professionCategories).map((v) => {
                            return <option key={v} value={v}>{v}</option>
                        })}
                    </select>
                </label>
                <label>Profession
                    <select name="profession" value={userForm.profession} onChange={handleUserChange}>
                        <option value="" disabled>Select Profession</option>
                        {professions.map((v) => {
                            return <option key={v} value={v}>{v}</option>
                        })}
                    </select>
                    {userForm.profession === "Other" && <input type="text" placeholder="type your profession" name="profession" value={prfsn} onChange={(e)=>setPrfsn(e.target.value)} />}
                </label>
            </fieldset>

            {/* ── LOCATION ── */}
            <fieldset>
                <legend>Location</legend>

                <label>Country *
                    <select name="country" value={userForm.country} onChange={handleUserChange} required>
                        <option value="" disabled>Select Country</option>
                        {countryList.getData().map((country, index) => {
                            return <option key={index + "ctry"} value={country.code}>{country.name}</option>
                        })}
                    </select>
                </label>

                <label>Postal Code
                    <input type="text" name="postal_code" value={userForm.postal_code} onChange={handleUserChange} />
                </label>
            </fieldset>

            {/* ── MENTOR SECTION (conditionally rendered) ── */}
            {isMentor && (
                <fieldset>
                    <legend>Mentor Details</legend>

                    <label>Experience (years) *
                        <input type="number" name="experience" value={mentorForm.experience} onChange={handleMentorChange} required />
                    </label>

                    <label>About
                        <textarea name="about" value={mentorForm.about} onChange={handleMentorChange} />
                    </label>

                    <label>Available From
                        <input type="time" name="available_from" value={mentorForm.available_from} onChange={handleMentorChange} />
                    </label>

                    <label>Available To
                        <input type="time" name="available_to" value={mentorForm.available_to} onChange={handleMentorChange} />
                    </label>

                    <label>Charge per session
                        <input type="number" name="charge" value={mentorForm.charge} onChange={handleMentorChange} />
                    </label>
                    {mentorForm.charge && <label>Currency
                        {/* <input type="number" name="charge" value={mentorForm.charge} onChange={handleMentorChange} /> */}
                        <select name="currency" value={mentorForm.currency} onChange={handleMentorChange}>
                            <option value="" >Select Currency</option>
                            {currencies.map((crncy, i) => {
                                return <option key={i + "cny"} value={crncy.code}>{crncy.name}-{crncy.symbol}</option>
                            })}
                        </select>
                    </label>}

                    <label>Achievements
                        <textarea name="achievements" value={mentorForm.achievements} onChange={handleMentorChange} />
                    </label>
                </fieldset>
            )}

            <button type="submit">
                {isMentor ? "Sign Up as Mentor" : "Sign Up"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

        </form>
    );
};
