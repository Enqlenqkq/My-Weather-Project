// js/utils.js

// 아이콘 매핑 데이터
export const iconMap = {
  "01d": "clear-day", // 맑음 (낮)
  "01n": "clear-night", // 맑음 (밤)
  "02d": "cloudy-1-day", // 구름 조금 (낮)
  "02n": "cloudy-1-night", // 구름 조금 (밤)
  "03d": "cloudy-3-day", // 구름 많음
  "03n": "cloudy-3-night",
  "04d": "cloudy", // 흐림 (먹구름) -> overcast나 cloudy 사용
  "04n": "cloudy",
  "09d": "rainy-2-day", // 소나기
  "09n": "rainy-2-night",
  "10d": "rainy-3-day", // 비 (낮)
  "10n": "rainy-3-night", // 비 (밤)
  "11d": "thunderstorms", // 천둥번개
  "11n": "thunderstorms",
  "13d": "snowy-3-day", // 눈
  "13n": "snowy-3-night",
  "50d": "fog-day", // 안개
  "50n": "fog-night",
};

// 아이콘 경로 반환 함수
export function getIconPath(code) {
  const fileName = iconMap[code] || "clear-day";
  return `./images/weather-icons/animated/${fileName}.svg`;
}

// 섭씨/화씨 변환 함수
export function getTemp(temp, isMetric) {
  if (isMetric) return Math.round(temp);
  return Math.round(temp * 1.8 + 32);
}

// 이미지 프리로딩
export function preloadImages() {
  // 미리 로딩할 이미지 목록 (파일명 정확해야 함)
  const imagesToLoad = [
    "./images/backgrounds/clear.jpg",
    "./images/backgrounds/clouds.jpg",
    "./images/backgrounds/rain.jpg",
    "./images/backgrounds/snow.jpg",
    "./images/backgrounds/thunder.jpg",
    "./images/backgrounds/night.jpg",
    "./images/backgrounds/default.jpg",
  ];

  imagesToLoad.forEach((src) => {
    const img = new Image(); // 가상의 이미지 태그 생성
    img.src = src; // 소스를 넣으면 브라우저가 자동으로 다운로드 시작
  });
}
