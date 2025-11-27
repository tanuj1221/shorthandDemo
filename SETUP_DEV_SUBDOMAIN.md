# Setup dev.shorthandexam.in with SSL

## Step 1: Create certbot webroot directory
```bash
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
```

## Step 2: Backup current nginx config
```bash
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
```

## Step 3: Update nginx configuration
```bash
# Copy the new nginx_updated.conf content to /etc/nginx/nginx.conf
sudo nano /etc/nginx/nginx.conf
# Paste the content from nginx_updated.conf file
```

## Step 4: Test nginx configuration
```bash
sudo nginx -t
```

## Step 5: Reload nginx (without SSL first)
```bash
sudo systemctl reload nginx
```

## Step 6: Obtain SSL certificate with certbot
```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d dev.shorthandexam.in \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

**Note:** Replace `your-email@example.com` with your actual email address.

## Step 7: Verify SSL certificate was created
```bash
sudo ls -la /etc/letsencrypt/live/dev.shorthandexam.in/
```

You should see:
- fullchain.pem
- privkey.pem
- cert.pem
- chain.pem

## Step 8: Test nginx configuration again
```bash
sudo nginx -t
```

## Step 9: Reload nginx with SSL
```bash
sudo systemctl reload nginx
```

## Step 10: Verify the site is working
```bash
# Test HTTP redirect
curl -I http://dev.shorthandexam.in

# Test HTTPS
curl -I https://dev.shorthandexam.in
```

## Step 11: Setup auto-renewal (if not already done)
```bash
# Test renewal
sudo certbot renew --dry-run

# Check certbot timer
sudo systemctl status certbot.timer
```

## Troubleshooting

### If certbot fails:
1. Make sure DNS A record for dev.shorthandexam.in points to your server IP
2. Check if port 80 is accessible: `sudo netstat -tlnp | grep :80`
3. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### If nginx test fails:
```bash
# Check syntax errors
sudo nginx -t

# View detailed error
sudo journalctl -u nginx -n 50
```

### Check if site is accessible:
```bash
# From server
curl http://localhost:3001

# From outside
curl https://dev.shorthandexam.in
```

## DNS Configuration Required

Before running certbot, make sure you have added an A record in your DNS:

```
Type: A
Name: dev
Value: YOUR_SERVER_IP
TTL: 3600 (or Auto)
```

Wait 5-10 minutes for DNS propagation, then verify:
```bash
nslookup dev.shorthandexam.in
# or
dig dev.shorthandexam.in
```

## Summary

After setup, you'll have:
- ✅ http://dev.shorthandexam.in → redirects to HTTPS
- ✅ https://dev.shorthandexam.in → proxies to port 3001 (same backend as production)
- ✅ SSL certificate from Let's Encrypt
- ✅ Auto-renewal configured
