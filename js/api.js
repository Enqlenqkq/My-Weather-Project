// js/api.js

// 현재 날씨 가져오기
export async function getWeather(city) {
  // 도시 입력값 검증
  if (!city) throw new Error("도시 이름을 입력해주세요!");

  // Vercel 서버리스 함수(중계기) 호출
  const response = await fetch(`/api/get-weather?city=${city}`);

  // HTTP 에러 처리
  if (!response.ok) throw new Error("날씨 정보를 가져올 수 없습니다.");

  // JSON 데이터 파싱 후 반환
  return await response.json();
}

// 예보 데이터 가져오기
export async function getForecast(city) {
  const response = await fetch(`./api/get-weather?city=${city}&type=forecast`);
  if (!response.ok) throw new Error(`예보 정보를 가져올 수 없습니다.`);
  return await response.json();
}
