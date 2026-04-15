package com.example.demo.controller

import com.example.demo.store.Weather
import com.example.demo.store.WeatherStore
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/weather")
class WeatherController(
    private val store: WeatherStore,
    @Value("\${app.api-key}") private val apiKey: String
) {
    @GetMapping
    fun get(
        @RequestParam city: String,
        @RequestHeader(value = "X-API-Key", required = false) providedKey: String?
    ): ResponseEntity<Any> {
        if (providedKey != apiKey) {
            return ResponseEntity.status(401).body(mapOf("error" to "Unauthorized"))
        }
        val data: Weather = store.get(city)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(data)
    }
}
