import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar, NavbarContent, NavbarItem } from '@heroui/react';
import { MemoryRouter, Link } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('Navbar Component Integration Tests', () => {
    const desktopNavlinks = [
        { href: '/', label: 'Home', id: 'home-link' },
        { href: '/surveylist', label: 'Umfragen', id: 'surveylist-link' },
        { href: '/messages', label: 'Nachrichten', id: 'messages-link' },
        { href: '/manageprofile', label: 'Profil verwalten', id: 'profil-verwalten' },
    ];

    it('should render desktop navigation links correctly', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Navbar className="hidden md:flex bg-sky-950 w-screen text-black text-xl">
                    <NavbarContent justify="center">
                        {desktopNavlinks.map((link, i) => (
                            <NavbarItem key={`${link.label}-${i}`}>
                                <Link to={link.href} id={link.id} className="text-white hover:bg-sky-800 px-3 py-3 rounded-xl transition-all">
                                    {link.label}
                                </Link>
                            </NavbarItem>
                        ))}
                    </NavbarContent>
                    <NavbarContent justify="end">
                        <NavbarItem>
                            <Link to="/login" className="text-white hover:bg-sky-800 px-3 py-3 rounded-xl transition-all" id="logout-link">
                                Logout
                            </Link>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>
            </MemoryRouter>
        );

        desktopNavlinks.forEach((link) => {
            expect(screen.getByText(link.label))
        });
        expect(screen.getByText('Logout'))
    });

    it('should navigate to the correct page when a link is clicked', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Navbar className="hidden md:flex bg-sky-950 w-screen text-black text-xl">
                    <NavbarContent justify="center">
                        {desktopNavlinks.map((link, i) => (
                            <NavbarItem key={`${link.label}-${i}`}>
                                <Link to={link.href} id={link.id} className="text-white hover:bg-sky-800 px-3 py-3 rounded-xl transition-all">
                                    {link.label}
                                </Link>
                            </NavbarItem>
                        ))}
                    </NavbarContent>
                    <NavbarContent justify="end">
                        <NavbarItem>
                            <Link to="/login" className="text-white hover:bg-sky-800 px-3 py-3 rounded-xl transition-all" id="logout-link">
                                Logout
                            </Link>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Profil verwalten'));
        expect(window.location.pathname = '/manageprofile')

        fireEvent.click(screen.getByText('Umfragen'));
        expect(window.location.pathname = '/surveylist')

        fireEvent.click(screen.getByText('Nachrichten'));
        expect(window.location.pathname = '/messages')

        fireEvent.click(screen.getByText('Home'));
        expect(window.location.pathname = '/')

        fireEvent.click(screen.getByText('Logout'));
        expect(window.location.pathname = '/login')
    });
});