import { Header } from "../../component/Header"
import { Footer } from "../../component/Footer"
import { Outlet } from "react-router-dom"
export const Layout : React.FC = ()=>{
    return(
        <>
        <Header/>
        <Outlet/>
        <Footer/>
        </>
    )
}