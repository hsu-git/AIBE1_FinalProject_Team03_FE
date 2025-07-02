import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumb() {
    const { pathname } = useLocation();
    const parts = pathname.split('/').filter(Boolean);

    return (
        <nav className="text-gray-400 text-sm flex items-center space-x-1">
            <Link to="/" className="hover:text-gray-200">
                Home
            </Link>
            {parts.map((part, i) => {
                const to = '/' + parts.slice(0, i + 1).join('/');
                return (
                    <span key={to} className="flex items-center">
                        <span className="mx-1">/</span>
                        {i < parts.length - 1 ? (
                            <Link to={to} className="hover:text-gray-200">
                                {decodeURIComponent(part)}
                            </Link>
                        ) : (
                            <span className="text-white">
                                {decodeURIComponent(part)}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
