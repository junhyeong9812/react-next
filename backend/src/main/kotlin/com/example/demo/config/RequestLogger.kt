package com.example.demo.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class RequestLogger(
    @Value("\${app.log-requests}") private val enabled: Boolean
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        if (enabled && request.requestURI.startsWith("/api/")) {
            logger.info("${request.method} ${request.requestURI}${request.queryString?.let { "?$it" } ?: ""}")
        }
        filterChain.doFilter(request, response)
    }
}
