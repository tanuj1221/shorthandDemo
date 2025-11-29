# Certbot Auto-Renewal Setup

Certbot automatically sets up renewal, but let's verify and ensure it's working correctly.

## Step 1: Check if certbot timer is active

```bash
sudo systemctl status certbot.timer
```

You should see: **Active: active (waiting)**

## Step 2: If timer is not active, enable it

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Step 3: Check certbot renewal configuration

```bash
sudo cat /etc/systemd/system/timers.target.wants/certbot.timer
```

Or check the service:

```bash
sudo systemctl cat certbot.timer
```

## Step 4: Test renewal (dry run)

This tests the renewal process without actually renewing:

```bash
sudo certbot renew --dry-run
```

You should see:
```
Congratulations, all simulated renewals succeeded
```

## Step 5: Check when certificates expire

```bash
sudo certbot certificates
```

This shows all certificates and their expiration dates.

## Step 6: Manually test renewal (optional)

If you want to force a renewal test:

```bash
sudo certbot renew --force-renewal
```

**Warning:** Only use this for testing, as Let's Encrypt has rate limits.

## Step 7: Check renewal logs

```bash
sudo cat /var/log/letsencrypt/letsencrypt.log
```

Or for recent renewals:

```bash
sudo journalctl -u certbot.timer
sudo journalctl -u certbot.service
```

## Step 8: Add a renewal hook (optional)

To reload nginx after renewal, create a renewal hook:

```bash
sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

Add this content:

```bash
#!/bin/bash
systemctl reload nginx
```

Make it executable:

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

## How Auto-Renewal Works

- **Certbot timer** runs twice daily (at random times)
- Checks if certificates are within 30 days of expiration
- If yes, automatically renews them
- Runs any deploy hooks (like reloading nginx)

## Verify Auto-Renewal Schedule

```bash
# Check timer schedule
sudo systemctl list-timers certbot.timer

# Or more detailed
sudo systemctl show certbot.timer
```

## Manual Renewal (if needed)

If you ever need to manually renew:

```bash
sudo certbot renew
```

## Troubleshooting

### If timer is not found:

```bash
# Install certbot timer
sudo apt install certbot python3-certbot-nginx

# Enable timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### If renewal fails:

1. Check nginx is running: `sudo systemctl status nginx`
2. Check port 80 is accessible: `sudo netstat -tlnp | grep :80`
3. Check logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
4. Verify webroot exists: `ls -la /var/www/certbot`

## Summary

✅ Certbot timer runs automatically twice daily
✅ Certificates renew 30 days before expiration
✅ Nginx reloads automatically after renewal
✅ No manual intervention needed

Your certificates will auto-renew! 🎉
