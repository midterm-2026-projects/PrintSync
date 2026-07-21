import React from 'react';
import { Link, useLocation } from 'react-router';

const navItems = ['Inventory', 'POS', 'Analytics'];

const AppHeader = () => {
    const location = useLocation();
    const activeTab = navItems.find(
        (item) => location.pathname === `/${item.toLowerCase()}`
    );

    return (
        <header data-testid="app-header" style={styles.header}>
            <h1 data-testid="system-name" style={styles.title}>PrintSync</h1>
            <nav style={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item}
                        to={`/${item.toLowerCase()}`}
                        data-testid={`nav-label-${item.toLowerCase()}`}
                        style={{
                            ...styles.navItem,
                            ...(activeTab === item ? styles.activeNavItem : {}),
                            textDecoration: 'none',
                        }}
                    >
                        {item}
                    </Link>
                ))}
            </nav>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 30px',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        borderRadius: '8px',
        marginBottom: '30px',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        margin: 0,
        letterSpacing: '1px',
        color: '#ffffff',
    },
    nav: {
        display: 'flex',
        gap: '24px',
    },
    navItem: {
        fontSize: '1rem',
        fontWeight: 500,
        cursor: 'default',
        padding: '6px 14px',
        borderRadius: '4px',
        color: '#cccccc',
        transition: 'color 0.2s ease',
    },
    activeNavItem: {
        color: '#ffffff',
        backgroundColor: '#0f3460',
        fontWeight: 700,
    },
};

export default AppHeader;
