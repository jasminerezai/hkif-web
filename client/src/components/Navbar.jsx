// Sticky top navigation bar. Present on every page.
// Auth-aware: changes its right-side links based on login state.
// Responsive: desktop links collapse into a hamburger on mobile.
//
// Reads from AuthContext via useAuth() — no props needed.
// Uses Button from ui/Button.jsx for consistent button styling.

import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
// Link:     renders an <a> that navigates without page reload
// NavLink:  same as Link but accepts a style/className function
//           that receives { isActive: boolean } — used for
//           the green underline on the current page's link
// useNavigate: returns a function to programmatically navigate
//              (used after logout to send user to home)

import { useAuth } from '../context/AuthContext.jsx'
import { Button } from './ui'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  // user:            the logged-in user object (or null)
  // isAuthenticated: boolean — true when user !== null
  // logout:          clears state + localStorage

  const navigate    = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  // menuOpen: controls whether the mobile drawer is visible

  // ── Handlers ─────────────────────────────────────────────────
  function closeMenu() {
    setMenuOpen(false)
  }

  function handleLogout() {
    logout()
    // Clears auth state and localStorage token
    navigate('/')
    // Send user back to home after logout
    closeMenu()
  }

  // ── NavLink style function ────────────────────────────────────
  // NavLink calls this with { isActive: true/false } automatically.
  // We return different styles for the active page vs others.
  // The green underline tells the user which page they're on.
  function navLinkStyle({ isActive }) {
    return {
      fontSize:       'var(--text-base)',
      fontWeight:     isActive ? 700 : 600,
      color:          isActive
                        ? 'var(--color-primary-dark)'
                        : 'var(--color-text)',
      borderBottom:   isActive
                        ? '2px solid var(--color-primary)'
                        : '2px solid transparent',
      // Transparent border when inactive keeps layout stable —
      // without it the element would shift 2px when becoming active
      paddingBottom:  '2px',
      textDecoration: 'none',
      transition:     'color 0.15s',
      whiteSpace:     'nowrap',
    }
  }

  return (
    <nav style={S.nav}>
      <div className="container" style={S.inner}>

        {/* ── Brand / Logo ──────────────────────────────────── */}
        <Link to="/" onClick={closeMenu} style={S.brand}>
          {/* Clicking the brand always goes to home and closes
              the mobile menu if it's open */}

          {/* Green square logo box */}
          <div style={S.logoBox}>
            <span style={S.logoLetters}>HK</span>
          </div>

          {/* Text next to the logo */}
          <div>
            <span style={S.brandName}>HKIF</span>
            <span style={S.brandSub}>Högskolan Kristianstad IF</span>
          </div>
        </Link>

        {/* ── Desktop links — hidden on mobile via .hide-mobile ── */}
        <div className="hide-mobile" style={S.desktopLinks}>

          {/* Schedule = home page */}
          <NavLink to="/" style={navLinkStyle} end>
            {/* end: only marks as active on exact "/" path.
                Without end, it would also be active on "/activities" etc. */}
            Schedule
          </NavLink>

          <NavLink to="/activities" style={navLinkStyle}>
            Activities
          </NavLink>

          {/* Auth-dependent section */}
          {isAuthenticated ? (
            // ── Logged in state ──
            <>
              <NavLink to="/profile" style={navLinkStyle}>
                {user?.name || 'Profile'}
                {/* user.name comes from the backend auth response.
                    The ?. operator safely reads name even if user is null.
                    Fallback to 'Profile' if name isn't set. */}
              </NavLink>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            // ── Logged out state ──
            <>
                <Button as={Link} to="/login" size="sm">
                    Log in
                </Button>
            </>
          )}
        </div>

        {/* ── Hamburger button — only shown on mobile ─────────── */}
        {/* .show-mobile class is defined in index.css:
            display: none on desktop, display: flex on mobile */}
        <button
          className="show-mobile"
          onClick={() => setMenuOpen(prev => !prev)}
          // Arrow function toggles: false→true, true→false
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          // aria-expanded tells screen readers if the menu is open
          style={S.hamburger}
        >
          {/* Three bars make the classic hamburger icon */}
          <span style={S.bar} />
          <span style={{ ...S.bar, opacity: menuOpen ? 0 : 1 }} />
          {/* Middle bar fades out when open — visual hint the X is implied */}
          <span style={S.bar} />
        </button>

      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {/* Only rendered when menuOpen is true — short-circuit rendering */}
      {menuOpen && (
        <div style={S.drawer} role="navigation" aria-label="Mobile menu">

          <NavLink to="/" onClick={closeMenu} style={S.drawerLink} end>
            Schedule
          </NavLink>

          <NavLink to="/activities" onClick={closeMenu} style={S.drawerLink}>
            Activities
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/profile" onClick={closeMenu} style={S.drawerLink}>
                {user?.name || 'Profile'}
              </NavLink>

              <button onClick={handleLogout} style={S.drawerLogoutBtn}>
                Log out
              </button>
            </>
          ) : (
            <>
                <NavLink to="/login" onClick={closeMenu} style={S.drawerLink}>
                    Log in
                </NavLink>
            </>
          )}

        </div>
      )}
    </nav>
  )
}

// ── Styles ────────────────────────────────────────────────────
// Kept at the bottom to not clutter the component logic above.
const S = {
  nav: {
    position:     'sticky',
    // sticky: the navbar stays at the top of the viewport
    // as the user scrolls down
    top:          0,
    zIndex:       100,
    // zIndex: ensures the navbar renders above page content
    // (cards, modals etc. should use lower z-index values)
    background:   '#ffffff',
    borderBottom: '1px solid var(--color-border)',
    height:       'var(--nav-height)',
    // var(--nav-height) is defined in index.css: 64px
    boxShadow:    'var(--shadow-sm)',
  },

  inner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    height:         '100%',
    // height: 100% fills the nav bar vertically
  },

  brand: {
    display:        'flex',
    alignItems:     'center',
    gap:            'var(--space-2)',
    textDecoration: 'none',
    flexShrink:     0,
    // flexShrink: 0 prevents the brand from compressing
    // when the nav links take up a lot of space
  },

  logoBox: {
    width:          36,
    height:         36,
    borderRadius:   'var(--radius-sm)',
    background:     'var(--color-primary)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  logoLetters: {
    color:      '#ffffff',
    fontFamily: 'var(--font-serif)',
    fontWeight: 700,
    fontSize:   '13px',
    lineHeight: 1,
  },

  brandName: {
    display:    'block',
    // display: block makes the <span> stack vertically
    // instead of sitting inline with brandSub
    fontFamily: 'var(--font-serif)',
    fontWeight: 700,
    fontSize:   'var(--text-lg)',
    color:      'var(--color-text)',
    lineHeight: 1.1,
  },

  brandSub: {
    display:    'block',
    fontSize:   'var(--text-xs)',
    color:      'var(--color-text-muted)',
    lineHeight: 1.2,
  },

  desktopLinks: {
    display:    'flex',
    alignItems: 'center',
    gap:        'var(--space-6)',
  },

  hamburger: {
    // Bare button reset — all visual treatment is in the bars
    display:       'flex',
    flexDirection: 'column',
    gap:           '5px',
    background:    'none',
    border:        'none',
    padding:       '6px',
    cursor:        'pointer',
  },

  bar: {
    display:      'block',
    width:        '22px',
    height:       '2px',
    background:   'var(--color-text)',
    borderRadius: '2px',
    transition:   'opacity 0.2s',
  },

  drawer: {
    position:      'absolute',
    // absolute relative to <nav> which has position: sticky
    top:           'var(--nav-height)',
    // Starts immediately below the navbar
    left:          0,
    right:         0,
    background:    '#ffffff',
    borderBottom:  '1px solid var(--color-border)',
    boxShadow:     'var(--shadow-md)',
    display:       'flex',
    flexDirection: 'column',
    padding:       'var(--space-4) var(--space-6) var(--space-6)',
    gap:           'var(--space-4)',
    zIndex:        99,
    // One below the nav's zIndex:100 — sits underneath it correctly
  },

  drawerLink: {
    fontSize:       'var(--text-base)',
    fontWeight:     600,
    color:          'var(--color-text)',
    textDecoration: 'none',
    padding:        '4px 0',
  },

  drawerLogoutBtn: {
    background:   'none',
    border:       '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding:      '10px var(--space-4)',
    fontWeight:   600,
    color:        'var(--color-text-muted)',
    cursor:       'pointer',
    textAlign:    'left',
    fontSize:     'var(--text-base)',
    fontFamily:   'var(--font-body)',
    // Must set — buttons don't inherit font
  },
}