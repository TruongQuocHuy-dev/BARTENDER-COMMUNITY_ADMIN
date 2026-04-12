import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

const TableActionMenu = ({ onEdit, onDelete, onView, customActions = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

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

    return (
        <div className="table-action-menu-container" ref={menuRef} style={{ position: 'relative', zIndex: isOpen ? 100 : 'auto' }}>
            <button
                className="action-icon-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                title="Thao tác"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="action-dropdown-menu">
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
