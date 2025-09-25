
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
      Nhiệm vụ: Tạo một bức ảnh ghép chân thực bằng cách kết hợp hai hình ảnh được cung cấp.
      - Hình ảnh 1: Một nhân vật.
      - Hình ảnh 2: Một sản phẩm.
      Yêu cầu:
      1. Tạo ra một hình ảnh mới, trong đó nhân vật đang sử dụng hoặc tương tác tự nhiên với sản phẩm.
      2. Đảm bảo tỷ lệ giữa nhân vật và sản phẩm là chính xác và hợp lý.
      3. Điều chỉnh ánh sáng, bóng đổ và phối cảnh để hình ảnh trông liền mạch và chân thực.
      4. Giữ nguyên phong cách và các chi tiết của nhân vật và sản phẩm gốc.
      5. Yêu cầu bổ sung từ người dùng: "${customPrompt}"
      Kết quả cuối cùng phải là một bức ảnh chất lượng cao và trông như được chụp thật.
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
