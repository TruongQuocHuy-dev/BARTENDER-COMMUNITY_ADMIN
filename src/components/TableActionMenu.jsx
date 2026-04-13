import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

const TableActionMenu = ({ onEdit, onDelete, onView, customActions = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const updateMenuPosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = 180;
        const menuHeight = 220;
        const spacing = 6;
        const viewportPadding = 8;

        const rawTop = rect.bottom + spacing;

        const top = Math.max(
            viewportPadding,
            Math.min(rawTop, window.innerHeight - menuHeight - viewportPadding)
        );

        const rawLeft = rect.right - menuWidth;
        const left = Math.max(
            viewportPadding,
            Math.min(rawLeft, window.innerWidth - menuWidth - viewportPadding)
        );

        setMenuStyle({
            position: 'fixed',
            top,
            left,
            right: 'auto',
            bottom: 'auto',
            width: menuWidth,
            zIndex: 2000,
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        updateMenuPosition();

        const handleViewportChange = () => updateMenuPosition();
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [isOpen]);

    return (
        <div className={`table-action-menu-container ${isOpen ? 'open' : ''}`} ref={menuRef}>
            <button
                ref={triggerRef}
                className="action-icon-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    const next = !isOpen;
                    setIsOpen(next);
                    if (next) updateMenuPosition();
                }}
                title="Thao tác"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="action-dropdown-menu" style={menuStyle || undefined}>
                    {onView && (
                        <button
                            className="action-dropdown-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onView();
                            }}
                        >
                            <Eye size={16} className="text-blue" />
                            <span>Xem chi tiết</span>
                        </button>
                    )}

                    {onEdit && (
                        <button
                            className="action-dropdown-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onEdit();
                            }}
                        >
                            <Edit size={16} className="text-orange" />
                            <span>Chỉnh sửa</span>
                        </button>
                    )}

                    {customActions.map((action, index) => (
                        <button
                            key={index}
                            className="action-dropdown-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                action.onClick();
                            }}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}

                    {onDelete && (
                        <>
                            {/* Divider if there are other actions */}
                            {(onView || onEdit || customActions.length > 0) && <div className="action-dropdown-divider"></div>}

                            <button
                                className="action-dropdown-item danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onDelete();
                                }}
                            >
                                <Trash2 size={16} />
                                <span>Xóa</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TableActionMenu;
