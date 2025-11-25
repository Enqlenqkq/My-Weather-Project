// js/api.js

// 도시 이름으로 날씨 가져오기
export async function getWeather(city) {
  if (!city) throw new Error("도시 이름을 입력해주세요!");
  const res = await fetch(`/api/get-weather?city=${city}`);
  if (!res.ok) throw new Error("날씨 정보를 가져올 수 없습니다.");
  return await res.json();
}

// 좌표(위도/경도)로 날씨 가져오기
export async function getWeatherByCoords(lat, lon) {
  const res = await fetch(`/api/get-weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("위치 정보를 가져올 수 없습니다.");
  return await res.json();
}

// 예보 데이터 가져오기
export async function getForecast(city, lat = null, lon = null) {
  let query = city ? `city=${city}` : `lat=${lat}&lon=${lon}`;
  const res = await fetch(`/api/get-weather?${query}&type=forecast`);
  if (!res.ok) throw new Error("예보 정보를 가져올 수 없습니다.");
  return await res.json();
}

// 미세먼지 데이터 가져오기
export async function getAirQuality(lat, lon) {
  const res = await fetch(
    `/api/get-weather?lat=${lat}&lon=${lon}&type=air_pollution`
  );
  if (!res.ok) return null; // 미세먼지는 실패해도 메인 날씨는 보여주기 위해 null 반환
  return await res.json();
}
