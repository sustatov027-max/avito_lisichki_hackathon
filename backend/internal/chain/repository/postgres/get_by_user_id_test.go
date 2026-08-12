package postgres

import (
	"reflect"
	"testing"
)

func TestNormalizePhotos(t *testing.T) {
	t.Setenv("DB_PASSWORD", "test")
	t.Setenv("BASE_URL", "http://localhost:8080/")

	photos := []string{
		" first.jpg ",
		"folder/second.jpg",
		"https://cdn.example.com/third.jpg",
		"",
	}
	want := []string{
		"http://localhost:8080/photos/first.jpg",
		"http://localhost:8080/photos/second.jpg",
		"https://cdn.example.com/third.jpg",
		"",
	}

	if got := normalizePhotos(photos); !reflect.DeepEqual(got, want) {
		t.Fatalf("normalizePhotos() = %#v, want %#v", got, want)
	}
}

func TestNormalizePhotosReturnsEmptySliceForNil(t *testing.T) {
	photos := normalizePhotos(nil)
	if photos == nil || len(photos) != 0 {
		t.Fatalf("normalizePhotos(nil) = %#v, want non-nil empty slice", photos)
	}
}
