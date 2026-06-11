export const PipelineModal = ({ modal, onClose }) => {
    if (!modal) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className={`modal-header modal-header--${modal.type}`}>
                    {modal.type === 'success' ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    )}
                    <span>{modal.title}</span>
                </div>
                <div className="modal-body">
                    {modal.items.map((item) => (
                        <div key={item.label} className="modal-row">
                            <span className="modal-label">{item.label}</span>
                            <span className="modal-value">{item.value}</span>
                        </div>
                    ))}
                </div>
                <button className="modal-close" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};
