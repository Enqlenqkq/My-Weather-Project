// js/main.js
import {
  getWeather,
  getWeatherByCoords,
  getForecast,
  getAirQuality,
} from "./api.js";

import {
  displayWeather,
  displayForecast,
  changeBackground,
  handleError,
  saveHistory,
  renderHistory,
} from "./ui.js";

import { preloadImages, getIconPath, getTemp } from "./utils.js";

let currentData = null;
let currentForecast = null;
let currentAir = null;
let isMetric = true;

// [접근성 추가] 모달을 열기 전 초점이 있던 요소를 저장할 변수
let lastFocusedElement = null;

// 페이지 로드가 끝나면 실행
window.addEventListener("load", () => {
  preloadImages();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(null, latitude, longitude);
      },
      () => {
        console.log("위치 권한 거부됨");
      } // 거부 시 아무것도 안 함 (기본 화면)
    );
  }

  renderHistory();
});

// 통합 데이터 가져오기 함수 (도시이름 OR 좌표)
async function fetchWeatherData(city, lat = null, lon = null) {
  try {
    // 현재 날씨
    if (city) currentData = await getWeather(city);
    else currentData = await getWeatherByCoords(lat, lon);

    // 좌표 업데이트 (도시 검색의 경우 API 결과에서 좌표 추출)
    const { lat: newLat, lon: newLon } = currentData.coord;

    // 예보 & 미세먼지 (병렬 요청으로 속도 향상)
    const [forecast, air] = await Promise.all([
      getForecast(null, newLat, newLon),
      getAirQuality(newLat, newLon),
    ]);

    currentForecast = forecast;
    currentAir = air;

    // UI 업데이트 (인자 추가됨)
    displayWeather(currentData, currentForecast, currentAir, isMetric);
    displayForecast(currentForecast, isMetric);
    changeBackground(currentData.weather[0].main, currentData.weather[0].icon);

    if (city) saveHistory(currentData.name);
  } catch (error) {
    handleError(error);
  }
}

// 검색 버튼 클릭 시
document.querySelector("#searchBtn").addEventListener("click", async () => {
  const city = document.querySelector("#cityInput").value;
  fetchWeatherData(city);
});

// 엔터 키 눌러서 검색
document.querySelector("#cityInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.querySelector("#searchBtn").click();
  }
});

// 검색 창 지우기
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

// 내비바
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// 요소 선택
const mobileMenu = document.querySelector("#mobileMenu");
const closeMenuBtn = document.querySelector("#closeMenuBtn");
const hamburgerBtn = document.querySelector(".hamburger-btn");

// 햄버거 버튼 누르면 열기
hamburgerBtn.addEventListener("click", () => {
  mobileMenu.classList.add("active"); // toggle 대신 add 사용 (확실하게 열기)
  // [접근성 추가] 모바일 메뉴 열리면 닫기 버튼으로 초점 이동
  setTimeout(() => closeMenuBtn.focus(), 100);
});

// X 버튼 누르면 닫기
closeMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
  // [접근성 추가] 닫히면 햄버거 버튼으로 초점 복귀
  hamburgerBtn.focus();
});

// 3. [추가] 메뉴 링크 누르면 자동으로 닫기 (UX 개선)
// 메뉴 안의 모든 a 태그를 찾아서 클릭 이벤트 달기
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    hamburgerBtn.focus(); // [접근성 추가] 초점 복귀
  });
});

// 단위 토글 스위치 (키보드 접근성 - Enter/Space 지원)
const unitToggleInput = document.querySelector("#unitToggle");
const unitToggleLabel = document.querySelector(".toggle-label");

// [접근성 추가] 라벨을 키보드로 눌렀을 때 체크박스 상태 변경
unitToggleLabel.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    unitToggleInput.click();
  }
});

unitToggleInput.addEventListener("change", () => {
  isMetric = !unitToggleInput.checked;
  if (currentData)
    displayWeather(currentData, currentForecast, currentAir, isMetric);
  if (currentForecast) displayForecast(currentForecast, isMetric);
});

// 대한민국 날씨 지도 구현
const majorCities = [
  { name: "서울", lat: 37.5665, lon: 126.978, top: "20%", left: "33%" },
  { name: "부산", lat: 35.1796, lon: 129.0756, top: "63%", left: "77%" },
  { name: "제주", lat: 33.4996, lon: 126.5312, top: "95%", left: "23%" },
  { name: "인천", lat: 37.4563, lon: 126.7052, top: "22%", left: "18%" },
  { name: "강릉", lat: 37.7519, lon: 128.876, top: "15%", left: "70%" },
  { name: "대전", lat: 36.3504, lon: 127.3845, top: "43%", left: "41%" },
  { name: "광주", lat: 35.1595, lon: 126.8526, top: "63%", left: "30%" },
  { name: "대구", lat: 35.8714, lon: 128.6014, top: "50%", left: "67%" },
];

const mapModal = document.querySelector("#koreaMapModal");
const mapContainer = document.querySelector("#korea-map-container");

// 지도 메뉴 클릭 시
document.querySelectorAll("#mapMenuBtn, #desktopMapBtn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    // [접근성 추가] 모달 열기 전, 현재 초점이 있는 요소 저장
    lastFocusedElement = document.activeElement;

    mapModal.classList.add("show");
    renderKoreaMap();
  });
});

// 지도 닫기 함수
function closeMapModal() {
  mapModal.classList.remove("show");
  // [접근성 추가] 모달 닫으면 원래 버튼으로 초점 복귀
  if (lastFocusedElement) lastFocusedElement.focus();
}

closeMapBtn.addEventListener("click", closeMapModal);

async function renderKoreaMap() {
  mapContainer.innerHTML = `<div class="loading">날씨 불러오는 중...</div>`;

  // 지도 배경 (CSS로 처리하거나 SVG 이미지 사용 권장)
  // 여기서는 간단히 div에 핀만 찍는 로직 구현
  let mapHtml = `<div class="korea-map-bg">`;

  // 모든 도시 날씨 병렬 호출
  const promises = majorCities.map((city) =>
    getWeatherByCoords(city.lat, city.lon)
  );
  const results = await Promise.all(promises);

  results.forEach((data, index) => {
    const cityInfo = majorCities[index];
    const iconPath = getIconPath(data.weather[0].icon);
    const temp = getTemp(data.main.temp, isMetric);

    mapHtml += `
            <div class="map-pin" style="top: ${cityInfo.top}; left: ${cityInfo.left}">
                <img src="${iconPath}" width="40">
                <span>${temp}°</span>
                <small>${cityInfo.name}</small>
            </div>
        `;
  });
  mapHtml += `</div>`;
  mapContainer.innerHTML = mapHtml;
}

// ==========================================
// ★ 정보(About) 모달 구현
// ==========================================
const infoModal = document.querySelector("#infoModal");
const closeInfoBtn = document.querySelector(".close-info");
const infoMenuBtns = document.querySelectorAll("#infoMenuBtn, #desktopInfoBtn");

// 1. 메뉴 버튼 클릭 시 열기
infoMenuBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // 링크 이동 방지

    // [접근성 추가] 초점 저장
    lastFocusedElement = document.activeElement;

    infoModal.classList.add("show");

    // [접근성 추가] 닫기 버튼으로 초점 이동
    closeInfoBtn.focus();
  });
});

// 2. 닫기 버튼 클릭 시 닫기
closeInfoBtn.addEventListener("click", () => {
  infoModal.classList.remove("show");

  // [접근성 추가] 초점 복귀
  if (lastFocusedElement) lastFocusedElement.focus();
});

// 3. 모달 바깥 배경 클릭 시 닫기 (지도 모달 + 정보 모달 통합 처리)
window.addEventListener("click", (e) => {
  if (e.target === infoModal) {
    infoModal.classList.remove("show");
  }
  if (e.target === mapModal) {
    mapModal.classList.remove("show");
  }
});

// 2. ESC 키 누르면 모달 닫기 (키보드 사용자 필수 UX)
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (infoModal.classList.contains("show")) closeInfoModal();
    if (mapModal.classList.contains("show")) closeMapModal();
  }
});

// 3. span 태그 버튼(닫기 버튼)에 엔터/스페이스 키 지원
// (HTML에서 tabindex="0" role="button"을 줬지만, 클릭 이벤트는 자동 발생 안함)
document.querySelectorAll(".close-map, .close-info").forEach((btn) => {
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click(); // 엔터/스페이스 누르면 클릭 이벤트 실행
    }
  });
});
