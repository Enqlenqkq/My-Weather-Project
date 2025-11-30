// js/ui.js
import { getIconPath, getTemp } from "./utils.js";

let tempChart = null;

function getDustStat(type, value) {
  let status = "";
  let cssClass = "";
  let icon = "";

  if (type === "PM10") {
    if (value <= 20) {
      status = "좋음";
      cssClass = "dust-good";
      icon = "🔵";
    } else if (value <= 35) {
      status = "보통";
      cssClass = "dust-normal";
      icon = "🟢";
    } else if (value <= 50) {
      status = "약간나쁨";
      cssClass = "dust-not-good";
      icon = "🟡";
    } else if (value <= 70) {
      status = "나쁨";
      cssClass = "dust-bad";
      icon = "🟠";
    } else if (value <= 100) {
      status = "매우 나쁨";
      cssClass = "dust-very-bad";
      icon = "🔴";
    } else {
      status = "위험";
      cssClass = "dust-danger";
      icon = "🟣";
    } // 100 초과 시
  } else if (type === "PM2.5") {
    if (value <= 10) {
      status = "좋음";
      cssClass = "dust-good";
      icon = "🔵";
    } else if (value <= 17) {
      status = "보통";
      cssClass = "dust-normal";
      icon = "🟢";
    } else if (value <= 25) {
      status = "약간나쁨";
      cssClass = "dust-not-good";
      icon = "🟡";
    } else if (value <= 35) {
      status = "나쁨";
      cssClass = "dust-bad";
      icon = "🟠";
    } else if (value <= 50) {
      status = "매우 나쁨";
      cssClass = "dust-very-bad";
      icon = "🔴";
    } else {
      status = "위험";
      cssClass = "dust-danger";
      icon = "🟣";
    } // 100 초과 시
  }
  return { status, cssClass, icon };
}

// 현재 날씨 표시 함수
export function displayWeather(data, forecastData, airData, isMetric) {
  const weatherResultDiv = document.querySelector("#weather-result");
  const unitTemp = isMetric ? "°C" : "°F";
  const unitSpeed = isMetric ? "m/s" : "mph";

  const iconUrl = getIconPath(data.weather[0].icon);
  const tempValue = getTemp(data.main.temp, isMetric);

  let pm10Html = "";
  let pm25Html = "";

  if (airData) {
    const pm10Value = airData.list[0].components.pm10;
    const pm25Value = airData.list[0].components.pm2_5;

    // 등급 판별
    const pm10Stat = getDustStat("PM10", pm10Value);
    const pm25Stat = getDustStat("PM2.5", pm25Value);

    // HTML 조립
    pm10Html = `
      <div class="dust-item ${pm10Stat.cssClass}">
         <span>미세먼지:</span>
         <span>${pm10Value}㎍/㎥</span>
         <span>${pm10Stat.status} ${pm10Stat.icon}</span>
      </div>
    `;
    pm25Html = `
      <div class="dust-item ${pm25Stat.cssClass}">
         <span>초미세먼지:</span>
         <span>${pm25Value}㎍/㎥</span>
         <span>${pm25Stat.status} ${pm25Stat.icon}</span>
      </div>
    `;
  } else {
    pm10Html = `<div>대기질 정보 없음</div>`;
  }

  // 일출/일몰 계산
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
    "ko-KR",
    { hour: "2-digit", minute: "2-digit" }
  );
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // HTML 구조 (아코디언 + 디테일 섹션 강화)
  weatherResultDiv.innerHTML = `
    <div class="weather-card" id="weatherCard">
        <div class="weather-header">
            <h2 class="city-name">${data.name}</h2>
            <div class="main-info">
              <img src="${iconUrl}" alt="날씨 아이콘" class="main-icon">
              <div class="temp-box">
                <h1 class="temp">${tempValue}${unitTemp}</h1>
                <p class="desc">${data.weather[0].description}</p>
                
                <div class="dust-info-box">
                   ${pm10Html}
                   ${pm25Html}
                </div>
              </div>
            </div>
        </div>

        <div class="weather-details">
            <div class="visual-grid">
                
                <div class="detail-card">
                   <div class="detail-title">💧 습도</div>
                   <div class="detail-value">${data.main.humidity}%</div>
                </div>

                <div class="detail-card">
                   <div class="detail-title">☀️ 일출 / 일몰</div>
                   <div class="detail-value" style="font-size: 1rem;">
                      ${sunrise}<br>${sunset}
                   </div>
                </div>

                <div class="detail-card">
                   <div class="detail-title">💨 풍속</div>
                   <div class="detail-value">${
                     data.wind.speed
                   } ${unitSpeed}</div>
                </div>

                <div class="detail-card">
                   <div class="detail-title">🌧️ 강수량</div>
                   <div class="detail-value">${
                     data.rain ? data.rain["1h"] || 0 : 0
                   }mm</div>
                </div>

            </div>

            <div class="chart-container">
               <canvas id="hourlyChart"></canvas>
            </div>
        </div>

        <div class="expand-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
    </div>
  `;

  // 아코디언 토글
  const card = document.getElementById("weatherCard");
  card.addEventListener("click", (e) => {
    // 캔버스 클릭 시 토글 방지 (그래프 터치 위해)
    if (e.target.tagName !== "CANVAS") {
      card.classList.toggle("expanded");
      if (card.classList.contains("expanded")) {
        renderChart(forecastData, isMetric); // 열릴 때 차트 그리기
      }
    }
  });
}

// Chart.js 그래프 그리기 함수
function renderChart(forecastData, isMetric) {
  const ctx = document.getElementById("hourlyChart").getContext("2d");

  // 기존 차트 파괴 (중복 방지)
  if (tempChart) tempChart.destroy();

  // 1. 목표 시간대 생성 로직 (현재 -> 짝수 시간 -> 2시간 간격)
  const targetTimes = [];
  const now = new Date();

  // 시작: 현재 시간 (정시로 맞춤)
  let currentTime = new Date(now);
  currentTime.setMinutes(0, 0, 0);
  targetTimes.push(new Date(currentTime));

  // 다음 짝수 시간 찾기
  let nextHour = currentTime.getHours() + 1;
  let nextTime = new Date(currentTime);

  if (currentTime.getHours() % 2 !== 0) {
    // 현재가 홀수 시(17시)면 -> 다음은 18시 (짝수)
    nextTime.setHours(nextHour);
  } else {
    // 현재가 짝수 시(16시)면 -> 다음은 18시 (+2시간)
    // *사용자 요청: 16시 -> 18시 -> 20시
    nextTime.setHours(currentTime.getHours() + 2);
  }

  // 목표 시간 배열 채우기 (총 7~8개 포인트)
  for (let i = 0; i < 7; i++) {
    targetTimes.push(new Date(nextTime));
    nextTime.setHours(nextTime.getHours() + 2); // 2시간씩 증가
  }

  // 2. 데이터 보간 (Interpolation) 로직
  // API 데이터(3시간 간격) 사이의 값을 계산해서 2시간 간격 온도를 추정합니다.
  const apiList = forecastData.list;

  const labels = [];
  const temps = [];

  targetTimes.forEach((target) => {
    const targetSec = Math.floor(target.getTime() / 1000);

    // 타겟 시간을 감싸는 앞뒤 데이터 찾기
    // API 데이터는 시간순 정렬되어 있다고 가정
    for (let i = 0; i < apiList.length - 1; i++) {
      const p1 = apiList[i];
      const p2 = apiList[i + 1];

      if (targetSec >= p1.dt && targetSec <= p2.dt) {
        // 비율 계산 (시간 차이만큼 온도 비례 배분)
        const ratio = (targetSec - p1.dt) / (p2.dt - p1.dt);

        // 온도 보간 (섭씨/화씨 변환 전 원본 데이터로 계산 후 변환)
        const interpolatedRawTemp =
          p1.main.temp + (p2.main.temp - p1.main.temp) * ratio;

        labels.push(target.getHours() + "시");
        temps.push(getTemp(interpolatedRawTemp, isMetric));
        break;
      }
    }
  });

  // 3. 차트 그리기 (데이터 라벨 플러그인 추가)
  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "온도",
          data: temps,
          borderColor: "#4db6ac", // 밝은 민트색
          backgroundColor: "rgba(77, 182, 172, 0.2)",
          borderWidth: 2,
          tension: 0.4, // 부드러운 곡선
          fill: true,
          pointBackgroundColor: "#fff", // 포인트 흰색
          pointBorderColor: "#4db6ac",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 30 }, // 위쪽 라벨 잘림 방지
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }, // 툴팁 끄기 (직관적으로 숫자 보여주므로)

        // [추가] 그래프 위에 숫자 그리기 플러그인 정의
        dataLabels: {
          // Chart.js 3.x 이상에서는 외부 플러그인 없이 afterDatasetsDraw로 직접 그림
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "black", font: { family: "NanumSquareNeo" } },
        },
        y: { display: false }, // Y축 숨김
      },
    },
    // 플러그인 직접 등록 (점 위에 숫자 표시)
    plugins: [
      {
        id: "customDataLabels",
        afterDatasetsDraw(chart, args, options) {
          const { ctx } = chart;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
              const data = dataset.data[index];

              ctx.fillStyle = "black"; // 글씨 색상 (다크테마에 맞춰 흰색)
              ctx.font = "bold 12px NanumSquareNeo";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";

              // 점 위로 10px 띄워서 그리기
              ctx.fillText(data + "°", element.x, element.y - 10);
            });
          });
        },
      },
    ],
  });
}

// 예보 날씨 표시 함수
export function displayForecast(data, isMetric) {
  const forecastContainer = document.querySelector("#forecast-result");

  if (!forecastContainer) return;
  if (!data.list) return;

  forecastContainer.innerHTML = ""; // 초기화

  const dailyData = [];
  for (let i = 0; i < data.list.length; i += 8) {
    dailyData.push(data.list[i]);
  }

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
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  history = history.filter(
    (savedCity) => savedCity.toLowerCase() !== city.toLowerCase()
  );

  history.unshift(city);

  if (history.length > MAX_HISTORY) history.pop(); // 맨 뒤 기록 삭제

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
