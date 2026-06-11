import { useState } from 'react';

export const HamburgerMenu = ({ onSaveImage, onSubmitDetails }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="menu-container">
            <button
                className="menu-hamburger"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Menu"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>
            {open && (
                <>
                    <div className="menu-backdrop" onClick={() => setOpen(false)} />
                    <div className="menu-dropdown">
                        <button className="menu-item" onClick={() => { setOpen(false); onSaveImage(); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                            Save Image
                        </button>
                        <button className="menu-item" onClick={() => { setOpen(false); onSubmitDetails(); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            Submit Details
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
