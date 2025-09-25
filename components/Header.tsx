
import React from 'react';

interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  return (
    <header className="relative w-full p-4 md:p-6 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Tủ quần áo của bạn
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-400">
          Tải lên ảnh nhân vật và sản phẩm để AI tạo ra một bức ảnh ghép hoàn hảo.
        </p>
      </div>
      {userEmail && (
        <div className="absolute right-4 md:right-8 flex items-center space-x-4">
            <span className="text-gray-300 hidden sm:block">Chào, {userEmail}</span>
            <button 
                onClick={onLogout}
                className="py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-all"
            >
                Đăng xuất
            </button>
        </div>
      )}
    </header>
  );
};

export default Header;