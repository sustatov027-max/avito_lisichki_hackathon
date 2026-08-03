package main

import (
	"log"

	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/app"
)

func main() {
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
