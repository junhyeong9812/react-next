package com.example.demo.controller

import com.example.demo.store.Post
import com.example.demo.store.PostStore
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/posts")
class PostController(
    private val store: PostStore,
    @Value("\${app.enable-patch}") private val enablePatch: Boolean,
    @Value("\${app.slow-endpoint-delay-ms}") private val slowDelayMs: Long
) {
    @GetMapping
    fun list(): List<Post> {
        Thread.sleep(300)
        return store.all()
    }

    @GetMapping("/{id}")
    fun detail(@PathVariable id: Int): ResponseEntity<Post> {
        val post = store.get(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(post)
    }

    @PatchMapping("/{id}")
    fun patch(
        @PathVariable id: Int,
        @RequestBody body: Map<String, Any?>
    ): ResponseEntity<Any> {
        if (!enablePatch) {
            return ResponseEntity.status(403).body(mapOf("error" to "PATCH disabled"))
        }
        val updated = store.patch(id, body) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(updated)
    }

    @GetMapping("/slow")
    fun slow(): List<Post> {
        Thread.sleep(slowDelayMs)
        return store.all()
    }
}
