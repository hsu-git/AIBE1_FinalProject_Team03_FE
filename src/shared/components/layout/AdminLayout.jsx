import React from 'react';
import { Outlet } from 'react-router-dom';
// import Header from './Header';
import AdminSidebar from '../../../features/admin/components/AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#0A0D11]">
            {/* <Header /> */}
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-0 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
