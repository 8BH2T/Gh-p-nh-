import React, { useState, useRef, useEffect } from 'react';
import type { ImageData, AlbumState } from '../types';

interface ProductAlbumProps {
  album: AlbumState;
  selectedImage: ImageData | null;
  onDelete: (imageId: string) => void;
  onSelect: (image: ImageData) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveImage: (imageId: string, folderId: string | null) => void;
}

const FolderIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const BackIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const DeleteIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const EditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;


const ProductAlbum: React.FC<ProductAlbumProps> = ({ album, selectedImage, onDelete, onSelect, onCreateFolder, onRenameFolder, onDeleteFolder, onMoveImage }) => {
  const [viewingFolderId, setViewingFolderId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  const viewingFolder = album.folders.find(f => f.id === viewingFolderId);
  const itemsToShow = viewingFolder ? viewingFolder.images : [...album.folders, ...album.rootImages];

  useEffect(() => {
    if (renamingFolderId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFolderId]);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingFolderId && folderName.trim()) {
      onRenameFolder(renamingFolderId, folderName.trim());
    }
    setRenamingFolderId(null);
  };

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData("imageId", imageId);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData("imageId");
    if (imageId) {
      onMoveImage(imageId, folderId);
    }
    setDragOverFolderId(null);
  };
  
  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  if (album.rootImages.length === 0 && album.folders.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-300">Album sản phẩm</h3>
        <button onClick={() => onCreateFolder('Thư mục mới')} className="text-sm bg-indigo-600/80 hover:bg-indigo-700 text-white py-1 px-3 rounded-md transition-colors">+ Tạo thư mục</button>
      </div>

      <div 
        onDrop={(e) => viewingFolderId && handleDrop(e, null)}
        onDragOver={(e) => viewingFolderId && handleDragOver(e, null)}
        onDragLeave={() => setDragOverFolderId(null)}
        className={`p-3 bg-gray-900/50 rounded-lg border border-gray-700 min-h-[120px] transition-colors ${dragOverFolderId === null && viewingFolderId ? 'bg-indigo-900/50 border-indigo-500' : ''}`}
      >
        {viewingFolder && (
            <button onClick={() => setViewingFolderId(null)} className="flex items-center mb-3 text-sm text-indigo-400 hover:text-indigo-300">
                <BackIcon /> Trở về Album
            </button>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(viewingFolderId === null ? album.folders : []).map(folder => (
            <div 
                key={folder.id} 
                className={`relative group aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-center cursor-pointer transition-colors ${dragOverFolderId === folder.id ? 'bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-500' : 'bg-gray-800/50'}`}
                onClick={() => setViewingFolderId(folder.id)}
                onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder.id); }}
                onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, folder.id); }}
                onDragLeave={() => setDragOverFolderId(null)}
            >
              <FolderIcon />
              {renamingFolderId === folder.id ? (
                 <form onSubmit={handleRenameSubmit} className="w-full">
                    <input 
                        ref={renameInputRef}
                        type="text" 
                        value={folderName} 
                        onChange={(e) => setFolderName(e.target.value)} 
                        onBlur={handleRenameSubmit}
                        onClick={e => e.stopPropagation()}
                        className="w-full bg-gray-600 text-white text-xs text-center rounded p-1 mt-1 outline-none"
                    />
                 </form>
              ) : (
                <p className="text-xs font-medium text-gray-300 mt-1 break-all">{folder.name}</p>
              )}
              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setRenamingFolderId(folder.id); setFolderName(folder.name); }} className="p-1 bg-gray-600/80 rounded-full hover:bg-gray-500"><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-1 bg-red-600/80 rounded-full hover:bg-red-500"><DeleteIcon /></button>
              </div>
            </div>
          ))}
          {(viewingFolderId === null ? album.rootImages : viewingFolder?.images ?? []).map((image) => (
            <div key={image.id} className="relative group aspect-square" draggable onDragStart={(e) => handleDragStart(e, image.id)}>
              <button
                onClick={() => onSelect(image)}
                className={`w-full h-full rounded-md overflow-hidden focus:outline-none ring-offset-2 ring-offset-gray-800 focus:ring-2 ${selectedImage?.id === image.id ? 'ring-2 ring-indigo-500' : 'ring-0'}`}
              >
                <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Product" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </button>
              <button
                onClick={() => onDelete(image.id)}
                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Delete product image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAlbum;
