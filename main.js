// main.js
console.log("main script loaded.");

// API 호출 및 데이터 처리
// 현재 날씨 가져오기
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

// 예보 데이터 가져오기
async function getForecast(city) {
  const response = await fetch(`./api/get-weather?city=${city}&type=forecast`);
  if (!response.ok) {
    throw new Error(`예보 정보를 가져올 수 없습니다.`);
  }
  return await response.json();
}

// DOM 업데이트 및 UI 조작
// 현재 날씨 표시 함수
function displayWeather(data) {
  // weather-result 부분 선택
  const weatherResultDiv = document.querySelector("#weather-result");

  // 날씨 아이콘 URL 생성
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

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

// 예보 날씨 표시 함수
function displayForecast(data) {
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
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString("ko-KR", { weekday: "short" });
    const temp = Math.round(item.main.temp);
    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    const cardHtml = `
      <div class="forecast-card">
        <div class="day">${dayName}</div>
        <img src="${iconUrl}" alt="icon">
        <div class="temp">${temp}°C</div>
      </div>
    `;
    forecastContainer.insertAdjacentHTML("beforeend", cardHtml);
  });
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

document.querySelector("#searchBtn").addEventListener("click", async () => {
  const city = document.querySelector("#cityInput").value;

  try {
    const weatherData = await getWeather(city);
    displayWeather(weatherData);

    const forecastData = await getForecast(city);
    displayForecast(forecastData);

    const cityName = weatherData.name;
    saveHistory(cityName);
  } catch (error) {
    handleError(error);
  }
});

document.querySelector("#cityInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.querySelector("#searchBtn").click();
  }
});

const cityInput = document.querySelector("#cityInput");
const clearBtn = document.querySelector("#clearBtn");

cityInput.addEventListener("input", () => {
  if (cityInput.value.length > 0) {
    clearBtn.style.display = "flex";
  } else {
    clearBtn.style.display = "none";
  }
});

clearBtn.addEventListener("click", () => {
  cityInput.value = ""; // 입력창 비우기
  clearBtn.style.display = "none"; // 버튼 숨기기
  cityInput.focus(); // 바로 다시 입력할 수 있게 커서 두기
});

// 최근 검색어 저장
const HISTORY_KEY = "weatherHistory";
const MAX_HISTORY = 5; // 최대 개수 5개

// 저장소 내용으로 화면에 버튼 만들기
function renderHistory() {
  const historyDiv = document.querySelector("#history-container");
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  historyDiv.innerHTML = ""; // 초기화

  history.forEach((city) => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.className = "history-btn";

    btn.addEventListener("click", async () => {
      // 1. 검색창에 도시 이름 채워주기
      document.querySelector("#cityInput").value = city;

      try {
        // 2. 현재 날씨 가져오기
        const weatherData = await getWeather(city);
        displayWeather(weatherData);

        // 3. [추가됨] 예보 데이터 가져오기
        const forecastData = await getForecast(city);
        displayForecast(forecastData);
      } catch (error) {
        handleError(error);
      }
    });

    historyDiv.appendChild(btn);
  });
}

// 검색어 저장 기능
function saveHistory(city) {
  // 저장소 꺼내서
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  // 중복 아니면
  history = history.filter(
    (savedCity) => savedCity.toLowerCase() !== city.toLowerCase()
  );
  // 맨 앞에 추가
  history.unshift(city);
  // 5개 넘으면
  if (history.length > MAX_HISTORY) {
    history.pop(); // 맨 뒤 기록 삭제
  }
  // 저장소에 다시 넣기
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

// 페이지 로드 완료 시 실행
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
});
