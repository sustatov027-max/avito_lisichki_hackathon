package main

import (
	"avito_lisichki_hackathon/avito_lisichki_hackathon/backend/internal/app"
	"log"
)

func main() {
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
