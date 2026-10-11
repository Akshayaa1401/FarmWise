package com.farmwise.dto;

import java.util.List;

public class WeatherResponseDTO {
    private String location;
    private double temperatureCelsius;
    private String condition;
    private Double chanceOfRain; // percentage, may be null
    private Double expectedRainfallMm; // may be null
    private List<Forecast> forecast; // next few days
    private List<String> alerts; // optional alerts

    // getters and setters
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public double getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(double temperatureCelsius) { this.temperatureCelsius = temperatureCelsius; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public Double getChanceOfRain() { return chanceOfRain; }
    public void setChanceOfRain(Double chanceOfRain) { this.chanceOfRain = chanceOfRain; }
    public Double getExpectedRainfallMm() { return expectedRainfallMm; }
    public void setExpectedRainfallMm(Double expectedRainfallMm) { this.expectedRainfallMm = expectedRainfallMm; }
    public List<Forecast> getForecast() { return forecast; }
    public void setForecast(List<Forecast> forecast) { this.forecast = forecast; }
    public List<String> getAlerts() { return alerts; }
    public void setAlerts(List<String> alerts) { this.alerts = alerts; }

    public static class Forecast {
        private String date; // ISO date
        private double minTempCelsius;
        private double maxTempCelsius;
        private String condition;
        // getters and setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public double getMinTempCelsius() { return minTempCelsius; }
        public void setMinTempCelsius(double minTempCelsius) { this.minTempCelsius = minTempCelsius; }
        public double getMaxTempCelsius() { return maxTempCelsius; }
        public void setMaxTempCelsius(double maxTempCelsius) { this.maxTempCelsius = maxTempCelsius; }
        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }
    }
}
