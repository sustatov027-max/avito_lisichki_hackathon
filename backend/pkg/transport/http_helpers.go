package transport

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Response interface {
	isResponse()
}

func WriteJson(w http.ResponseWriter, statusCode int, payload Response) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal response: %w", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	_, err = w.Write(data)
	return err
}
