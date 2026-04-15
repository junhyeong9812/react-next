package com.example.demo.store

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

data class Post(
    val id: Int,
    var title: String,
    var body: String,
    val author: String,
    var updatedAt: String
)

@Component
class PostStore(private val mapper: ObjectMapper) {
    private val posts: MutableMap<Int, Post> = ConcurrentHashMap()

    init {
        val stream = ClassPathResource("data/posts.json").inputStream
        val loaded: List<Post> = mapper.readValue(stream)
        loaded.forEach { posts[it.id] = it }
    }

    fun all(): List<Post> = posts.values.sortedBy { it.id }

    fun get(id: Int): Post? = posts[id]

    fun patch(id: Int, patch: Map<String, Any?>): Post? {
        val current = posts[id] ?: return null
        (patch["title"] as? String)?.let { current.title = it }
        (patch["body"] as? String)?.let { current.body = it }
        current.updatedAt = Instant.now().toString()
        return current
    }
}
