// main.js
console.log("main script loaded.");

// API 호출 및 데이터 처리
async function getWeather(city) {
  // 도시 입력값 검증
  if (!city) {
    throw new Error("도시 이름을 입력해주세요!");
  }

  // Vercel 서버리스 함수(중계기) 호출
  const response = await fetch(`/api/get-weather?city=${city}`);

  // HTTP 에러 처리
  if (!response.ok) {
    throw new Error(`날씨 정보를 가져올 수 없습니다. (${response.status})`);
  }

  // JSON 데이터 파싱 후 반환
  const data = await response.json();
  return data;
}

// DOM 업데이트 및 UI 조작
function displayWeather(data) {
  // weather-result 부분 선택
  const weatherResultDiv = document.querySelector("#weather-result");

  // 날씨 아이콘 URL 생성
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // HTML 업데이트 (카드 디자인 적용)
  weatherResultDiv.innerHTML = `
        <div class="weather-card">
            <h2>${data.name}</h2>
            <img src="${iconUrl}" alt="날씨 아이콘">
            <h1 class="temp">${Math.round(data.main.temp)}°C</h1>
            <p class="desc">${data.weather[0].description}</p>
            <div class="details">
                <span>💧 습도 ${data.main.humidity}%</span>
                <span>💨 풍속 ${data.wind.speed}m/s</span>
            </div>
        </div>
    `;
}

// 오류 처리
function handleError(error) {
  console.error("에러 발생:", error);
  const weatherResultDiv = document.querySelector("#weather-result");

  // 에러 메시지 표시
  weatherResultDiv.innerHTML = `
        <div class="weather-card" style="color: red;">
            <h3>오류 발생 ⚠️</h3>
            <p>${error.message}</p>
            <p>도시 이름을 다시 확인해주세요.</p>
        </div>
    `;
}

document.querySelector("#searchBtn").addEventListener("click", () => {
  const city = document.querySelector("#cityInput").value;
  getWeather(city)
    .then((data) => displayWeather(data))
    .catch((error) => handleError(error));
});
