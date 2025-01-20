import React from 'react';
import '@/app/components/navbar.css';



const Navbar = () => {
    return (

        <nav className="navbar">
            <div className="navbar-pages">

                <ul className="nav-links">
                    <li>
                        <a href="/"> Home</a>
                    </li>
                    <li>
                        <a href="/">Freundeslist</a>
                    </li>
                    <li>
                        <a href="/">Gruppenliste</a>
                    </li>
                    <li>
                        <a href="/"> Offene Umfragen</a>
                    </li>
                    <li>
                        <a href="/"> Benachrichtigungen</a>
                    </li>
                    <li>
                        <a href="/"> Profil verwalten</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;