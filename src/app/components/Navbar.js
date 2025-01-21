import React from 'react';
import '@/app/components/navbar.css';



const Navbar = () => {
    return (

        <nav className="navbar" id="navbar">
            <div className="navbar-pages">

                <ul className="nav-links" >
                    <li>
                        <a href="/"> Home</a>
                    </li>
                    <li>
                        <a href="/friendlist">Freundeslist</a>
                    </li>
                    <li>
                        <a href="/grouplist">Gruppenliste</a>
                    </li>
                    <li>
                        <a href="/surveylist"> Offene Umfragen</a>
                    </li>
                    <li>
                        <a href="/messages"> Benachrichtigungen</a>
                    </li>
                    <li>
                        <a href="/manageprofile"> Profil verwalten</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;