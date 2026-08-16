import { Route, Routes } from "react-router-dom"
import { Layout } from "./pages/static/Layout"
import { Home } from "./pages/static/Home"
import { FindTalent } from "./pages/FindTalent"
import { HowItWorks } from "./pages/static/HowItWorks"
import { ContactUs } from "./pages/ContactUs"
import { Feedbacks } from "./pages/Feedbacks"
import { Login } from "./pages/auth/Login"
import { Signup } from "./pages/auth/Signup"
import { Profile } from "./pages/profile/Profile"
import { UpdateProfile } from "./pages/profile/UpdateProfile"
import BookSession from "./pages/session/BookSession.tsx"
import MySessions from "./pages/session/MySessions.tsx"
import DetailedSession from "./pages/session/DetailedSession.tsx"
import { Membership } from "./pages/Membership"
import { AboutUs } from "./pages/static/AboutUs"
import { MentorProfile } from "./pages/profile/MentorProfile"
import ResetPassword from "./pages/auth/ResetPassword"
import PageNotFound from "./pages/static/PageNotFound.tsx"
// import { OtpVerification } from "./component/cards/OtpVerification"
function App() {
  return (
    <>
      {/* Route definitions — renders page content below nav */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/find-talent" element={<FindTalent />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit-profile" element={<UpdateProfile />} />
          <Route path="/mentor/:hash" element={<MentorProfile />} />

          <Route path="/book-session/:hash" element={<BookSession />} />
          <Route path="/my-sessions" element={<MySessions />} />
          <Route path="/session/:hash" element={<DetailedSession />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="*" element={<PageNotFound />} />

        </Route>
      </Routes>
    </>
  )
}

export default App
