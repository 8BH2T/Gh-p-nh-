
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import ProductAlbum from './components/ProductAlbum';
import Auth from './components/Auth';
import type { ImageData, ResultData, AlbumState } from './types';
import { generateMontage } from './services/geminiService';

const App: React.FC = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('currentUserEmail');
  });

  const [characterImage, setCharacterImage] = useState<ImageData | null>(null);
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [productAlbum, setProductAlbum] = useState<AlbumState>({ rootImages: [], folders: [] });
  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserEmail) {
      const savedAlbum = localStorage.getItem(`albumState_${currentUserEmail}`);
      if (savedAlbum) {
        setProductAlbum(JSON.parse(savedAlbum));
      } else {
        setProductAlbum({ rootImages: [], folders: [] });
      }
    }
  }, [currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`albumState_${currentUserEmail}`, JSON.stringify(productAlbum));
    }
  }, [productAlbum, currentUserEmail]);

  const handleLogin = (email: string) => {
    localStorage.setItem('currentUserEmail', email);
    setCurrentUserEmail(email);
  };

  const handleSignup = (email: string) => {
    localStorage.setItem('currentUserEmail', email);
    setCurrentUserEmail(email);
    setProductAlbum({ rootImages: [], folders: [] });
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUserEmail');
    setCurrentUserEmail(null);
    setCharacterImage(null);
    setProductImage(null);
    setPrompt('');
    setProductAlbum({ rootImages: [], folders: [] });
    setResult(null);
    setError(null);
  };

  const handleProductImageUpload = (imageData: Omit<ImageData, 'id'> | null) => {
    if (imageData) {
      const newImage: ImageData = {
        ...imageData,
        id: `${Date.now()}-${Math.random()}` 
      };
      setProductImage(newImage);
      if (!productAlbum.rootImages.some(img => img.base64 === newImage.base64) && !productAlbum.folders.some(f => f.images.some(img => img.base64 === newImage.base64))) {
         setProductAlbum(prevAlbum => ({
            ...prevAlbum,
            rootImages: [newImage, ...prevAlbum.rootImages],
        }));
      }
    } else {
        setProductImage(null);
    }
  };

  const handleDeleteFromAlbum = (imageIdToDelete: string) => {
    if (productImage?.id === imageIdToDelete) {
      setProductImage(null);
    }
    setProductAlbum(currentAlbum => {
      const newRootImages = currentAlbum.rootImages.filter(img => img.id !== imageIdToDelete);
      const newFolders = currentAlbum.folders.map(folder => ({
        ...folder,
        images: folder.images.filter(img => img.id !== imageIdToDelete),
      }));
      return { rootImages: newRootImages, folders: newFolders };
    });
  };

  const handleSelectFromAlbum = (image: ImageData) => {
    setProductImage(image);
  };

  const handleCreateFolder = (name: string) => {
    const newFolder = { id: `${Date.now()}`, name, images: [] };
    setProductAlbum(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setProductAlbum(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === folderId ? { ...f, name: newName } : f)
    }));
  };
  
  const handleDeleteFolder = (folderId: string) => {
    setProductAlbum(prev => {
        const folderToDelete = prev.folders.find(f => f.id === folderId);
        if (!folderToDelete) return prev;
        const newRootImages = [...prev.rootImages, ...folderToDelete.images];
        const newFolders = prev.folders.filter(f => f.id !== folderId);
        return { folders: newFolders, rootImages: newRootImages };
    });
  };
  
  const handleMoveImage = (imageId: string, destinationFolderId: string | null) => {
     setProductAlbum(currentAlbum => {
        let imageToMove: ImageData | undefined;
        let sourceFolderId: string | null = null; 

        imageToMove = currentAlbum.rootImages.find(img => img.id === imageId);
        if (imageToMove) {
            sourceFolderId = null;
        } else {
            for (const folder of currentAlbum.folders) {
                const found = folder.images.find(img => img.id === imageId);
                if (found) {
                    imageToMove = found;
                    sourceFolderId = folder.id;
                    break;
                }
            }
        }

        if (!imageToMove || sourceFolderId === destinationFolderId) {
            return currentAlbum;
        }

        let newRootImages = [...currentAlbum.rootImages];
        let newFolders = currentAlbum.folders.map(f => ({...f, images: [...f.images]}));

        if (sourceFolderId === null) {
            newRootImages = newRootImages.filter(img => img.id !== imageId);
        } else {
            const sourceFolder = newFolders.find(f => f.id === sourceFolderId)!;
            sourceFolder.images = sourceFolder.images.filter(img => img.id !== imageId);
        }

        if (destinationFolderId === null) {
            newRootImages.push(imageToMove);
        } else {
            const destFolder = newFolders.find(f => f.id === destinationFolderId)!;
            destFolder.images.push(imageToMove);
        }

        return { rootImages: newRootImages, folders: newFolders };
    });
  };

  const handleGenerateClick = useCallback(async () => {
    if (!characterImage || !productImage) {
      setError('Vui lòng tải lên cả ảnh nhân vật và ảnh sản phẩm.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedResult = await generateMontage(characterImage, productImage, prompt);
      setResult(generatedResult);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [characterImage, productImage, prompt]);

  if (!currentUserEmail) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header userEmail={currentUserEmail} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader id="character-uploader" title="1. Tải ảnh nhân vật" image={characterImage} onImageUpload={(img) => setCharacterImage(img ? {...img, id: 'char'} : null)} />
              <ImageUploader id="product-uploader" title="2. Tải ảnh sản phẩm" image={productImage} onImageUpload={handleProductImageUpload} />
            </div>
            
             <ProductAlbum
                album={productAlbum}
                selectedImage={productImage}
                onDelete={handleDeleteFromAlbum}
                onSelect={handleSelectFromAlbum}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onMoveImage={handleMoveImage}
            />

            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold text-gray-300 mb-2">3. Thêm yêu cầu (tùy chọn)</label>
              <textarea
                id="prompt"
                rows={2}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200 placeholder-gray-400"
                placeholder="Ví dụ: nhân vật đang mặc chiếc áo này và đi dạo trong công viên..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !characterImage || !productImage}
              className="w-full py-3 px-4 text-lg font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo ảnh ghép'}
            </button>
          </div>
          
          <ResultDisplay result={result} isLoading={isLoading} error={error} />

        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
