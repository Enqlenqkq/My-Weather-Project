// js/ui.js
import { getIconPath, getTemp } from "./utils.js";

// 현재 날씨 표시 함수
export function displayWeather(data, isMetric) {
  // weather-result 부분 선택
  const weatherResultDiv = document.querySelector("#weather-result");
  const unitText = isMetric ? "°C" : "°F";
  const tempValue = getTemp(data.main.temp, isMetric);

  // 날씨 아이콘 URL 생성
  const iconCode = data.weather[0].icon;
  const iconUrl = getIconPath(iconCode);

  // HTML 업데이트 (카드 디자인 적용)
  weatherResultDiv.innerHTML = `
        <div class="weather-card">
            <h2>${data.name}</h2>
            <img src="${iconUrl}" alt="날씨 아이콘">
            <h1 class="temp">${tempValue}${unitText}</h1>
            <p class="desc">${data.weather[0].description}</p>
            <div class="details">
                <span>💧 습도 ${data.main.humidity}%</span>
                <span>💨 풍속 ${data.wind.speed}m/s</span>
            </div>
        </div>
    `;
  changeBackground(data.weather[0].main, data.weather[0].icon);
}

// 예보 날씨 표시 함수
export function displayForecast(data, isMetric) {
  const forecastContainer = document.querySelector("#forecast-result");

  // 안전장치
  if (!forecastContainer) return;

  // 1. 데이터 확인 (여기서 data가 없으면 에러가 났던 것)
  console.log("예보 데이터:", data);

  // 2. 목록이 없으면 중단
  if (!data.list) return;

  forecastContainer.innerHTML = ""; // 초기화

  // 3. 24시간 간격(8개씩 건너뛰기)으로 데이터 필터링
  const dailyData = [];
  for (let i = 0; i < data.list.length; i += 8) {
    dailyData.push(data.list[i]);
  }

  // 4. 카드 생성 (최대 5개)
  dailyData.slice(0, 5).forEach((item) => {
    const unitText = isMetric ? "°C" : "°F";
    const tempValue = getTemp(item.main.temp, isMetric);
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString("ko-KR", { weekday: "short" });
    const iconCode = item.weather[0].icon;
    const iconUrl = getIconPath(iconCode);

    const cardHtml = `
      <div class="forecast-card">
        <div class="day">${dayName}</div>
        <img src="${iconUrl}" alt="icon">
        <div class="temp">${tempValue}${unitText}</div>
      </div>
    `;
    forecastContainer.insertAdjacentHTML("beforeend", cardHtml);
  });
}

// 동적 배경 함수
export function changeBackground(weatherMain, iconCode) {
  const heroSection = document.querySelector(".hero-section");
  let bgImage = "default.jpg"; // 기본값

  const isNight = iconCode.includes("n");

  if (isNight) {
    bgImage = "night.jpg"; // 밤이면 무조건 밤 배경
  } else {
    switch (weatherMain) {
      case "Clear":
        bgImage = "clear.jpg";
        break;
      case "Clouds":
        bgImage = "clouds.jpg";
      case "Mist":
      case "Haze":
      case "Fog":
        bgImage = "clouds.jpg";
        break;
      case "Rain":
        bgImage = "rain.jpg";
        break;
      case "Drizzle":
        bgImage = "rain.jpg";
        break;
      case "Thunderstorm":
        bgImage = "thunder.jpg";
        break;
      case "Snow":
        bgImage = "snow.jpg";
        break;
      default:
        bgImage = "default.jpg";
    }
  }
  heroSection.style.backgroundImage = `url('./images/backgrounds/${bgImage}')`;
}

// 오류 처리
export function handleError(error) {
  console.error("에러 발생:", error);
  const weatherResultDiv = document.querySelector("#weather-result");

  // 에러 메시지 표시
  weatherResultDiv.innerHTML = `
        <div class="weather-card" style="color: red;">
            <h3>오류 발생 ⚠️: ${error}</h3>
            <p>${error.message}</p>
        </div>
    `;
}

// 최근 검색어 저장
const HISTORY_KEY = "weatherHistory";
const MAX_HISTORY = 5; // 최대 개수 5개

// 검색어 저장 기능
export function saveHistory(city) {
  // 저장소 꺼내서
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  // 중복 아니면
  history = history.filter(
    (savedCity) => savedCity.toLowerCase() !== city.toLowerCase()
  );
  // 맨 앞에 추가
  history.unshift(city);
  // 5개 넘으면
  if (history.length > MAX_HISTORY) history.pop(); // 맨 뒤 기록 삭제

  // 저장소에 다시 넣기
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

// 저장소 내용으로 화면에 버튼 만들기
export function renderHistory() {
  const historyDiv = document.querySelector("#history-container");
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  historyDiv.innerHTML = ""; // 초기화

  history.forEach((city) => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.className = "history-btn";

    btn.addEventListener("click", () => {
      const searchBtn = document.querySelector("#searchBtn");
      const cityInput = document.querySelector("#cityInput");

      cityInput.value = city;
      searchBtn.click();
    });

    historyDiv.appendChild(btn);
  });
}
