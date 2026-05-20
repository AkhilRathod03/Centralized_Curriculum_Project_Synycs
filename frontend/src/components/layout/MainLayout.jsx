import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { darkMode } = useContext(ThemeContext);
    const location = useLocation();

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area */}
            <motion.div 
                className="flex-grow-1 d-flex flex-column" 
                animate={{ 
                    marginLeft: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: 'auto' }}
            >
                {/* Top Navigation */}
                <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Main Page Content with Transitions */}
                <main className="p-4 flex-grow-1 custom-scrollbar">
                    <div className="container-fluid p-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </motion.div>
            
            <style>{`
                .max-w-fit { max-width: fit-content; }
                .italic { font-style: italic; }
                .uppercase { text-transform: uppercase; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .letter-spacing-2 { letter-spacing: 2px; }
            `}</style>
        </div>
    );
};

export default MainLayout;
