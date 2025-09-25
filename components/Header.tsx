
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-4 md:p-6 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 text-center">
      <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
        Trình tạo ảnh ghép AI
      </h1>
      <p className="mt-2 text-sm md:text-base text-gray-400">
        Tải lên ảnh nhân vật và sản phẩm để AI tạo ra một bức ảnh ghép hoàn hảo.
      </p>
    </header>
  );
};

export default Header;
