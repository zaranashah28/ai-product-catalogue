.PHONY: up

up:
	docker compose up --build --wait
	@printf '\nCatalogue  http://localhost:8080\nMailpit    http://localhost:8025\n'
