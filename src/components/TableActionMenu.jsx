import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

const TableActionMenu = ({ onEdit, onDelete, onView, customActions = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({ visibility: 'hidden' });
    const [isOpeningUpward, setIsOpeningUpward] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateMenuPosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const menuRect = dropdownRef.current?.getBoundingClientRect();
        const menuWidth = menuRect?.width || 180;
        const menuHeight = menuRect?.height || 220;
        const spacing = 6;
        const viewportPadding = 8;

        const canOpenDown = rect.bottom + spacing + menuHeight <= window.innerHeight - viewportPadding;
        const top = canOpenDown
            ? rect.bottom + spacing
            : Math.max(viewportPadding, rect.top - menuHeight - spacing);

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
            minWidth: 180,
            zIndex: 4000,
            visibility: 'visible',
        });
        setIsOpeningUpward(!canOpenDown);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isInsideContainer = containerRef.current?.contains(event.target);
            const isInsideDropdown = dropdownRef.current?.contains(event.target);
            if (!isInsideContainer && !isInsideDropdown) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setMenuStyle({ visibility: 'hidden' });
            return;
        }

        const raf = window.requestAnimationFrame(() => {
            updateMenuPosition();
        });

        const handleViewportChange = () => updateMenuPosition();
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [isOpen, updateMenuPosition]);

    return (
        <div className={`table-action-menu-container ${isOpen ? 'open' : ''}`} ref={containerRef}>
            <button
                ref={triggerRef}
                className="action-icon-btn"
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    const next = !isOpen;
                    setIsOpen(next);
                }}
                title="Thao tác"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className={`action-dropdown-menu ${isOpeningUpward ? 'open-upward' : ''}`}
                    style={menuStyle || undefined}
                    role="menu"
                >
                    {onView && (
                        <button
                            className="action-dropdown-item"
                            type="button"
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
                            type="button"
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
                            type="button"
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
                                type="button"
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default TableActionMenu;
