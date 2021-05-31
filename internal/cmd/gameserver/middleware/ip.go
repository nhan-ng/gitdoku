package middleware

import (
	"context"
	"fmt"
	"net/http"
)

type ipContextKey string

var contextKey ipContextKey = "ip"

func IPMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := getIP(r)
			ctx := context.WithValue(r.Context(), contextKey, ip)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ForContext(ctx context.Context) (string, error) {
	if ip := ctx.Value(contextKey); ip != nil {
		return ip.(string), nil
	}

	return "", fmt.Errorf("IP does not exist in the context")
}

func getIP(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}

	return r.RemoteAddr
}
