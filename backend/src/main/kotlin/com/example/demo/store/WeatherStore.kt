package com.example.demo.store

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component

data class Weather(val temp: Int, val condition: String)

@Component
class WeatherStore(mapper: ObjectMapper) {
    private val weather: Map<String, Weather>

    init {
        val stream = ClassPathResource("data/weather.json").inputStream
        weather = mapper.readValue(stream)
    }

    fun get(city: String): Weather? = weather[city.lowercase()]
}
