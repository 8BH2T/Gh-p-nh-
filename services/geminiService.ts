
import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageData, ResultData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMontage = async (
  characterImage: ImageData,
  productImage: ImageData,
  customPrompt: string
): Promise<ResultData> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const prompt = `
      Nhiệm vụ: Tạo một bức ảnh ghép chân thực, trong đó nhân vật từ Hình ảnh 1 đang mặc sản phẩm từ Hình ảnh 2.
      - Hình ảnh 1: Một nhân vật (người mẫu).
      - Hình ảnh 2: Một sản phẩm quần áo hoặc phụ kiện.
      Yêu cầu chính:
      1. **Mặc đồ**: Chỉnh sửa hình ảnh để nhân vật mặc sản phẩm một cách tự nhiên, vừa vặn như thể nó được làm riêng cho họ.
      2. **Chân thực**: Giữ nguyên các đặc điểm của nhân vật (khuôn mặt, vóc dáng, màu da). Điều chỉnh ánh sáng, bóng đổ, và các nếp gấp của vải để sản phẩm hòa hợp hoàn hảo với cơ thể nhân vật và môi trường xung quanh.
      3. **Giữ chi tiết**: Giữ nguyên tất cả các chi tiết, màu sắc và họa tiết của sản phẩm.
      4. **Yêu cầu thêm**: Nếu có, hãy kết hợp yêu cầu sau từ người dùng: "${customPrompt}"
      
      Đầu ra: Một bức ảnh chất lượng cao, nhân vật trong ảnh xuất hiện một cách tự nhiên khi mặc sản phẩm đã tải lên.
    `.trim();

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: characterImage.base64, mimeType: characterImage.mimeType } },
          { inlineData: { data: productImage.base64, mimeType: productImage.mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    let resultImage: string | null = null;
    let resultText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                resultImage = part.inlineData.data;
            } else if (part.text) {
                resultText = part.text;
            }
        }
    }

    if (!resultImage) {
        throw new Error("AI không thể tạo ra hình ảnh. Vui lòng thử lại với hình ảnh hoặc yêu cầu khác.");
    }
    
    return { image: resultImage, text: resultText };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return Promise.reject(error);
    }
    return Promise.reject(new Error("An unknown error occurred while generating the image."));
  }
};
