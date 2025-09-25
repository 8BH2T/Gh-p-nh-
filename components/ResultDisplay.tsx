
import React from 'react';
import type { ResultData } from '../types';
import Spinner from './Spinner';

interface ResultDisplayProps {
  result: ResultData | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, error }) => {
  const PlaceholderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23-.693L4.2 15.3m15.6 0c1.252 2.167 1.68 4.816 1.445 7.348a25.496 25.496 0 01-4.137 5.108M4.2 15.3c-1.252 2.167-1.68 4.816-1.445 7.348a25.496 25.496 0 004.137 5.108m11.262-12.454c.252.252.468.527.65.814m-9.562 0c-.182-.287-.398-.562-.65-.814m0 0c-1.566-2.246-4.33-3.6-7.412-3.6a9.041 9.041 0 00-7.412 3.6" />
    </svg>
  );

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-center text-gray-200 mb-4">Kết quả</h2>
      <div className="w-full aspect-square bg-gray-800 rounded-md flex items-center justify-center p-2">
        {isLoading ? (
          <Spinner message="AI đang sáng tạo..." />
        ) : error ? (
          <div className="text-center text-red-400 p-4">
            <p className="font-semibold">Đã xảy ra lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : result?.image ? (
          <img
            src={`data:image/png;base64,${result.image}`}
            alt="Generated Montage"
            className="object-contain w-full h-full rounded-md"
          />
        ) : (
          <div className="text-center text-gray-500">
            <PlaceholderIcon />
            <p>Hình ảnh của bạn sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
      {result?.text && !isLoading && !error && (
        <div className="mt-4 p-3 bg-gray-800 rounded-md">
          <p className="text-sm text-gray-300">{result.text}</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
