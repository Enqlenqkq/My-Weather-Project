// js/main.js
import { getWeather, getForecast } from "./api.js";
import {
  displayWeather,
  displayForecast,
  changeBackground,
  handleError,
  saveHistory,
  renderHistory,
} from "./ui.js";
import { preloadImages } from "./utils.js";

let currentData = null;
let currentForecast = null;
let isMetric = true; // true = 섭씨, false = 화씨

// 페이지 로드가 끝나면 백그라운드에서 이미지 미리 받기 실행
window.addEventListener("load", preloadImages);

// 검색 버튼 클릭 시
document.querySelector("#searchBtn").addEventListener("click", async () => {
  const city = document.querySelector("#cityInput").value;
  try {
    currentData = await getWeather(city);
    currentForecast = await getForecast(city);

    displayWeather(currentData, isMetric);
    displayForecast(currentForecast, isMetric);
    changeBackground(currentData.weather[0].main, currentData.weather[0].icon);
    saveHistory(currentData.name);
  } catch (error) {
    handleError(error);
  }
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

// 페이지 로드 완료 시 실행
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
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

const hamburgerBtn = document.querySelector(".hamburger-btn");
const mobileMenu = document.querySelector("#mobileMenu");

hamburgerBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");
});

// 단위 토글 스위치
document.querySelector("#unitToggle").addEventListener("change", () => {
  isMetric = !document.querySelector("#unitToggle").checked;
  if (currentData) displayWeather(currentData, isMetric);
  if (currentForecast) displayForecast(currentForecast, isMetric);
});
