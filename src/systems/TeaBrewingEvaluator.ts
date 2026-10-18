import { TeaBrewingProfile } from '../data/teaBrewingProfiles';

export interface BrewingParameters {
  teaQuantity: number;
  waterVolume: number;
  waterTemperature: number;
  steepingDuration: number;
}

export interface SimulatedTeaResult {
  strength: 'nhẹ' | 'vừa' | 'đậm';
  color: 'vàng xanh nhạt' | 'vàng xanh' | 'vàng hổ phách';
  aroma: string;
  firstTaste: string;
  astringency: string;
  bitterness: string;
  mouthfeel: string;
  aftertaste: string;
  summary: string;
  suggestion: string;
}

/** A deterministic learning model based on relative distance from a configurable reference. */
export class TeaBrewingEvaluator {
  public static evaluate(profile: TeaBrewingProfile, params: BrewingParameters): SimulatedTeaResult {
    const ratio = params.teaQuantity / Math.max(1, params.waterVolume);
    const referenceRatio = profile.referenceTeaQuantity / profile.referenceWaterVolume;
    const ratioDelta = (ratio - referenceRatio) / referenceRatio;
    const [minTemp, maxTemp] = profile.referenceTemperatureRange;
    const [minSteep, maxSteep] = profile.referenceSteepingRange;
    const strength: SimulatedTeaResult['strength'] = ratioDelta < -profile.allowedTolerance.ratioPercent / 100
      ? 'nhẹ'
      : ratioDelta > profile.allowedTolerance.ratioPercent / 100 ? 'đậm' : 'vừa';
    const extractionHigh = params.waterTemperature > maxTemp + profile.allowedTolerance.temperatureC
      || params.steepingDuration > maxSteep + profile.allowedTolerance.steepingSeconds;
    const extractionLow = params.waterTemperature < minTemp - profile.allowedTolerance.temperatureC
      || params.steepingDuration < minSteep - profile.allowedTolerance.steepingSeconds;
    const color: SimulatedTeaResult['color'] = extractionHigh || strength === 'đậm'
      ? 'vàng hổ phách'
      : strength === 'nhẹ' || extractionLow ? 'vàng xanh nhạt' : 'vàng xanh';
    const aroma = params.waterTemperature < minTemp
      ? 'hương dịu, có thể còn kín'
      : params.waterTemperature > maxTemp ? 'hương rang và thực vật rõ hơn trong mô phỏng' : 'hương thực vật dịu';
    const firstTaste = strength === 'nhẹ' || extractionLow ? 'thanh nhẹ' : strength === 'đậm' || extractionHigh ? 'đậm rõ' : 'cân bằng theo công thức';
    const astringency = extractionHigh || strength === 'đậm' ? 'có thể se rõ hơn' : strength === 'nhẹ' || extractionLow ? 'se nhẹ' : 'se dịu trong mô phỏng';
    const bitterness = extractionHigh ? 'có thể rõ hơn' : 'không nổi trội trong mô phỏng';
    const mouthfeel = strength === 'đậm' || extractionHigh
      ? 'đậm và có thể se hơn'
      : strength === 'nhẹ' || extractionLow ? 'thanh, nhẹ' : 'cân bằng theo công thức tham khảo';
    const aftertaste = strength === 'nhẹ' ? 'hậu vị thoảng nhẹ' : 'hậu vị lưu lại vừa phải';

    let suggestion = 'Thông số khá gần công thức tham khảo. Bạn có thể đổi từng yếu tố ở lần pha sau để so sánh.';
    if (params.steepingDuration < minSteep - profile.allowedTolerance.steepingSeconds) suggestion = 'Thời gian ngắn hơn công thức tham khảo; nước trà có thể còn nhẹ. Thử hãm thêm vài giây rồi so sánh.';
    else if (params.steepingDuration > maxSteep + profile.allowedTolerance.steepingSeconds) suggestion = 'Hãm lâu hơn công thức tham khảo có thể làm nước trà đậm và se hơn trong mô phỏng. Lần sau thử rót sớm hơn.';
    else if (strength === 'đậm') suggestion = 'Trà được pha khá đậm trong mô phỏng. Lần sau, thử giảm lượng trà hoặc tăng lượng nước.';
    else if (strength === 'nhẹ') suggestion = 'Nước trà có thể nhẹ hơn mong muốn. Thử tăng lượng trà một chút hoặc giảm lượng nước.';
    else if (params.waterTemperature < minTemp) suggestion = 'Nhiệt độ thấp hơn khoảng tham khảo; thử tăng nhiệt để so sánh cách hương trà thể hiện.';
    else if (params.waterTemperature > maxTemp) suggestion = 'Nhiệt độ cao hơn khoảng tham khảo; thử giảm nhiệt để so sánh độ đậm và cảm giác se.';

    return {
      strength,
      color,
      aroma,
      firstTaste,
      astringency,
      bitterness,
      mouthfeel,
      aftertaste,
      summary: `Trong mô phỏng này, chén trà có sắc ${color}, độ đậm ${strength} và ${mouthfeel}.`,
      suggestion
    };
  }
}
