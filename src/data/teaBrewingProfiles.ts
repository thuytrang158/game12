export interface TeaBrewingProfile {
  teaProductId: string;
  processingCategory: string;
  referenceTeaQuantity: number;
  referenceWaterVolume: number;
  referenceTemperatureRange: [number, number];
  referenceSteepingRange: [number, number];
  allowedTolerance: { ratioPercent: number; temperatureC: number; steepingSeconds: number };
  educationalDescription: string;
}

/**
 * Illustrative in-game starting recipe from one producer's table for Trà Móc Câu:
 * 5 g per 100 ml, 85 C, first infusion 25 seconds. The game batch is not certified
 * as that producer's product, so this is a learning reference, not a universal rule.
 * Source: https://thuantrathainguyen.com/blogs/news/cach-pha-tra-thai-nguyen-ngon
 */
export const TEA_BREWING_PROFILES: Record<string, TeaBrewingProfile> = {
  tea_processed_tan_cuong: {
    teaProductId: 'tea_processed_tan_cuong',
    processingCategory: 'Trà xanh sao khô thủ công',
    referenceTeaQuantity: 5,
    referenceWaterVolume: 100,
    referenceTemperatureRange: [85, 85],
    referenceSteepingRange: [25, 25],
    allowedTolerance: { ratioPercent: 25, temperatureC: 8, steepingSeconds: 8 },
    educationalDescription: 'Hồ sơ minh họa: một nhà sản xuất nêu cho trà Móc Câu 5 g/100 ml, nước 85°C và nước đầu 25 giây. Mẻ trà trong game không được xác định là cùng sản phẩm; đây là gợi ý để thử, không phải quy tắc chung.'
  }
};
