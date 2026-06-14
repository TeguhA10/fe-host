import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Users, GitMerge, Briefcase, UserSquare2, 
  ShoppingBag, Store, Package, FileCheck, ChevronDown, ChevronRight, 
  Menu, X, LogOut, User, Bell, ChevronLeft
} from 'lucide-react';
import { getDB } from '../data/db';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Track open state for submenus
  const [hrisOpen, setHrisOpen] = useState(location.pathname.startsWith('/hris'));
  const [purchasingOpen, setPurchasingOpen] = useState(location.pathname.startsWith('/purchasing'));

  const db = getDB();
  const userBranch = db.branches.find(b => b.id === user?.branchId);
  const userRole = db.roles.find(r => r.id === user?.roleId);

  const isActive = (path) => location.pathname === path;
  const isParentActive = (prefix) => location.pathname.startsWith(prefix);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate breadcrumbs based on route
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    const crumbs = [{ label: 'Dashboard', path: '/dashboard' }];
    
    let currentPath = '';
    paths.forEach((path, idx) => {
      currentPath += `/${path}`;
      if (path === 'dashboard') return;
      
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      if (path === 'hris') label = 'HRIS';
      if (path === 'purchase-orders') label = 'Purchase Orders';
      
      // If it's a numeric ID (e.g. employee details, PO details)
      if (!isNaN(path)) {
        label = `Detail #${path}`;
      }
      
      crumbs.push({ label, path: currentPath });
    });
    
    return crumbs;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      type: 'link'
    },
    {
      title: 'HRIS',
      icon: Users,
      type: 'submenu',
      state: hrisOpen,
      setState: setHrisOpen,
      prefix: '/hris',
      children: [
        { title: 'Dashboard', path: '/hris', icon: LayoutDashboard },
        { title: 'Karyawan', path: '/hris/employees', icon: Users },
        { title: 'Cabang / Branches', path: '/hris/branches', icon: GitMerge },
        { title: 'Jabatan / Positions', path: '/hris/positions', icon: Briefcase },
        { title: 'User Accounts', path: '/hris/users', icon: UserSquare2, roleRequired: 'superadmin' }
      ]
    },
    {
      title: 'Purchasing',
      icon: ShoppingBag,
      type: 'submenu',
      state: purchasingOpen,
      setState: setPurchasingOpen,
      prefix: '/purchasing',
      children: [
        { title: 'Dashboard', path: '/purchasing', icon: LayoutDashboard },
        { title: 'Vendors', path: '/purchasing/vendors', icon: Store },
        { title: 'Catalog Items', path: '/purchasing/items', icon: Package },
        { title: 'Purchase Orders', path: '/purchasing/purchase-orders', icon: FileCheck }
      ]
    }
  ];

  const filteredChildren = (submenu) => {
    return submenu.children.filter(item => !item.roleRequired || item.roleRequired === user?.roleId);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/25">
            ARG
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-wide text-sm">ERP ENTERPRISE</span>
            <span className="text-[10px] text-slate-500 font-medium">Anyar Retail Group</span>
          </div>
        </Link>
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="hidden lg:block text-slate-400 hover:text-white rounded p-1 hover:bg-slate-800"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {menuItems.map((menu, idx) => {
          if (menu.type === 'link') {
            return (
              <Link
                key={idx}
                to={menu.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(menu.path)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <menu.icon size={18} />
                <span>{menu.title}</span>
              </Link>
            );
          }

          const isSubActive = isParentActive(menu.prefix);

          return (
            <div key={idx} className="space-y-1">
              <button
                onClick={() => menu.setState(!menu.state)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isSubActive 
                    ? 'text-indigo-400 bg-slate-800/40' 
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <menu.icon size={18} />
                  <span>{menu.title}</span>
                </div>
                {menu.state ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {menu.state && (
                <div className="pl-6 space-y-1 mt-1 border-l border-slate-800 ml-6">
                  {filteredChildren(menu).map((child, cIdx) => (
                    <Link
                      key={cIdx}
                      to={child.path}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive(child.path)
                          ? 'bg-indigo-600/95 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <child.icon size={14} />
                      <span>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Session Info & Logout in Sidebar for Mobile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center space-x-3 px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-indigo-400 ring-2 ring-indigo-500/20">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{userRole?.name}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="mt-3 w-full flex items-center justify-center space-x-2 rounded-lg bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-150"
        >
          <LogOut size={14} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50">
      {/* Desktop Sidebar (Left side) */}
      <aside className={`hidden lg:block h-full transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden shadow-xl`}>
        <div className="w-64 h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Modal Backdrop */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-slate-900 transition-all duration-300">
            <div className="absolute right-4 top-4">
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Central Content Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="hidden lg:flex text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>

            {/* Branch Indicator Badge */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              <Store className="mr-1.5" size={12} />
              {userBranch ? userBranch.name : 'All Branches'}
            </span>
          </div>

          {/* User Options Dropdown & Notifications */}
          <div className="flex items-center space-x-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all">
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500"></span>
              <Bell size={18} />
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-700">{user?.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{userRole?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-all duration-150"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 md:space-x-2 text-xs font-medium text-slate-500">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="mx-1 md:mx-2 text-slate-400" size={12} />}
                  {index === getBreadcrumbs().length - 1 ? (
                    <span className="text-slate-800 font-semibold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-slate-700">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Page Outlet */}
          <div className="mx-auto max-w-7xl animate-all">
            <Outlet />
          </div>
        </main>

        {/* Simple Footer */}
        <footer className="flex h-10 w-full items-center justify-between border-t border-slate-200 bg-white px-6 text-center text-[10px] font-medium text-slate-400">
          <span>&copy; {new Date().getFullYear()} PT. Anyar Retail Group. All Rights Reserved.</span>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>Microservices API Gateway Connected (Mocked)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
