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
    .then((data) => {
      displayWeather(data);
      const cityName = data.current ? data.current.name : data.name;
      if (cityName) {
        console.log(`저장할 도시 이름: ${cityName}`);
        saveHistory(cityName);
      } else {
        console.error("도시 이름을 찾을 수 없습니다.", data);
      }
    })
    .catch((error) => handleError(error));
});

// 최근 검색어 저장
const HISTORY_KEY = "weatherHistory";
const MAX_HISTORY = 5; // 최대 개수 5개

// 저장소 내용으로 화면에 버튼 만들기
function renderHistory() {
  const historyDiv = document.querySelector("#history-container");

  // history = 저장소에서 꺼낸 기록들의 배열 -> 없으면 빈 배열
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  historyDiv.innerHTML = ""; // init

  history.forEach((city) => {
    // button 요소 생성 후 btn에 할당
    const btn = document.createElement("button");

    // 버튼 텍스트
    btn.textContent = city;

    // 버튼 클래스
    btn.className = "history-btn";

    // 버튼이 할 일 지정; 누르면 자동으로 해당 도시 검색
    btn.addEventListener("click", () => {
      document.querySelector("#cityInput").value = city;
      getWeather(city)
        .then((data) => displayWeather(data))
        .catch((error) => handleError(error));
    });

    // 버튼 붙이기
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
