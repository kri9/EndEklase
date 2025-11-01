fetch-certs:
	docker-compose -f docker-compose.prod.yaml run --rm certbot certonly --webroot -w /var/www/certbot -d funnyenglish.eu --agree-tos --no-eff-email
