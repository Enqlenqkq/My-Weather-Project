export default async function handler(request, response) {
  const apiKey = process.env.WEATHER_API_KEY;

  const city = request.query.city;

  if (!city) {
    response.status(400).json({ error: "도시 이름이 필요합니다." });
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=kr`;

  try {
    const fetchResponce = await fetch(apiUrl);

    if (!fetchResponce.ok) {
      const errorData = await fetchResponce.json();
      return response.status(fetchResponce.status).json(errorData);
    }

    const data = await fetchResponce.json();

    response.status(200).json(data);
  } catch (error) {
    response
      .status(500)
      .json({ error: "날씨 정보를 불러오는 데 실패했습니다." });
  }
}
