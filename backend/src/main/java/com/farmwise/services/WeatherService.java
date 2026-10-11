package com.farmwise.services;

import com.farmwise.dto.WeatherResponseDTO;
import com.farmwise.dto.WeatherResponseDTO.Forecast;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.TreeMap;
import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    private static final String API_BASE = "https://api.openweathermap.org/data/2.5/weather";
    private static final String FORECAST_BASE = "https://api.openweathermap.org/data/2.5/forecast";
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;

    public WeatherService() {
        // Retrieve API key from environment variable; may be null.
        this.apiKey = System.getenv("OPENWEATHER_API_KEY");
    }

    @Cacheable(value = "weather", key = "#location", unless = "#result == null")
    public WeatherResponseDTO getWeatherForLocation(String location) {
        if (apiKey == null || apiKey.isBlank()) {
            // No API key configured; caller will handle message.
            return null;
        }
        if (location == null || location.isBlank()) {
            // Missing location; cannot query.
            return null;
        }
        try {
            // Current weather
            String url = UriComponentsBuilder.fromHttpUrl(API_BASE)
                    .queryParam("q", location)
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric")
                    .toUriString();
            Map<String, Object> current = restTemplate.getForObject(url, Map.class);
            // Forecast (next 5 days, 3h step) – we will condense to daily forecast.
            String forecastUrl = UriComponentsBuilder.fromHttpUrl(FORECAST_BASE)
                    .queryParam("q", location)
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric")
                    .toUriString();
            Map<String, Object> forecastData = restTemplate.getForObject(forecastUrl, Map.class);

            return mapToDto(location, current, forecastData);
        } catch (Exception ex) {
            // Log the exception (could use logger) and return null to indicate failure.
            System.err.println("WeatherService error: " + ex.getMessage());
            return null;
        }
    }

    private WeatherResponseDTO mapToDto(String location, Map<String, Object> current, Map<String, Object> forecastData) {
        WeatherResponseDTO dto = new WeatherResponseDTO();
        dto.setLocation(location);
        // Current
        if (current == null || !(current.get("main") instanceof Map)) {
            throw new IllegalStateException("Weather provider returned an incomplete current-weather response.");
        }
        Map<String, Object> main = (Map<String, Object>) current.get("main");
        Object temperature = main.get("temp");
        if (!(temperature instanceof Number)) {
            throw new IllegalStateException("Weather provider response did not contain a temperature.");
        }
        dto.setTemperatureCelsius(((Number) temperature).doubleValue());
        List<Map<String, Object>> weatherArray = (List<Map<String, Object>>) current.get("weather");
        if (weatherArray != null && !weatherArray.isEmpty()) {
            dto.setCondition((String) weatherArray.get(0).get("description"));
        }
        // Rain chance / expected rainfall (if present)
        if (current.containsKey("rain")) {
            Map<String, Object> rain = (Map<String, Object>) current.get("rain");
            Object rainVal = rain.get("1h");
            if (rainVal == null) rainVal = rain.get("3h");
            if (rainVal != null) {
                double mm = ((Number) rainVal).doubleValue();
                dto.setExpectedRainfallMm(mm);
                dto.setChanceOfRain(100.0);
            }
        }
        // Forecast conversion to daily summary
        if (forecastData != null && forecastData.containsKey("list")) {
            List<Map<String, Object>> list = (List<Map<String, Object>>) forecastData.get("list");
            Map<String, List<Map<String, Object>>> byDate = new TreeMap<>();
            for (Map<String, Object> entry : list) {
                String dtTxt = (String) entry.get("dt_txt");
                String date = dtTxt.split(" ")[0];
                byDate.computeIfAbsent(date, k -> new ArrayList<>()).add(entry);
            }
            List<Forecast> forecasts = new ArrayList<>();
            int count = 0;
            for (String date : byDate.keySet()) {
                if (count >= 5) break;
                List<Map<String, Object>> dayEntries = byDate.get(date);
                double min = Double.MAX_VALUE;
                double max = -Double.MAX_VALUE;
                String condition = null;
                for (Map<String, Object> e : dayEntries) {
                    Map<String, Object> m = (Map<String, Object>) e.get("main");
                    double tMin = ((Number) m.get("temp_min")).doubleValue();
                    double tMax = ((Number) m.get("temp_max")).doubleValue();
                    if (tMin < min) min = tMin;
                    if (tMax > max) max = tMax;
                    if (condition == null) {
                        List<Map<String, Object>> wf = (List<Map<String, Object>>) e.get("weather");
                        if (wf != null && !wf.isEmpty()) {
                            condition = (String) wf.get(0).get("description");
                        }
                    }
                }
                Forecast f = new Forecast();
                f.setDate(date);
                f.setMinTempCelsius(min);
                f.setMaxTempCelsius(max);
                f.setCondition(condition != null ? condition : "");
                forecasts.add(f);
                count++;
            }
            dto.setForecast(forecasts);
        }
        dto.setAlerts(null);
        return dto;
    }
}
