# Deploying Vertex Retail AI Search to Vercel

This guide explains how to deploy the Vertex Retail AI search integration to Vercel using environment variables.

## Overview

The integration supports **two authentication methods**:

1. **Keyfile Path** (local development) - `GOOGLE_APPLICATION_CREDENTIALS`
2. **Credentials JSON** (Vercel/production) - `GCP_SERVICE_ACCOUNT_CREDENTIALS`

The client will automatically use the appropriate method based on what's available, with the following priority:

1. `GCP_SERVICE_ACCOUNT_CREDENTIALS` (JSON string) - **Preferred for Vercel**
2. `GOOGLE_APPLICATION_CREDENTIALS` (file path) - Local development
3. Application Default Credentials - Fallback

## Setting Up Vercel Environment Variables

### 1. Navigate to Vercel Project Settings

Go to your Vercel project → **Settings** → **Environment Variables**

### 2. Add Required Environment Variables

Add the following environment variables (all available for **Production**, **Preview**, and **Development**):

#### Essential Variables:

```bash
# Enable Vertex Retail AI search
ENABLE_VERTEX_RETAIL_SEARCH=true

# Google Cloud Project ID
GCP_PROJECT_ID=your-project-id

# Vertex Retail API location (typically "global")
VERTEX_RETAIL_LOCATION=global

# Catalog name (typically "default_catalog")
VERTEX_RETAIL_CATALOG=default_catalog

# Serving config name (e.g., "default_search")
# Full path will be auto-constructed as:
# projects/{PROJECT}/locations/{LOCATION}/catalogs/{CATALOG}/servingConfigs/{PLACEMENT}
VERTEX_RETAIL_PLACEMENT=default_search

# Service account credentials (JSON string)
# Paste your entire service account JSON key as a single-line string
GCP_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

#### Optional Variables:

```bash
# Leave empty unless you have a specific placement
VERTEX_RETAIL_PLACEMENT=
```

## Step-by-Step: Adding to Vercel

### Using Vercel Dashboard:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Click **Add New**
   - Enter the **Key** (e.g., `GCP_SERVICE_ACCOUNT_CREDENTIALS`)
   - Paste the **Value**
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

### Using Vercel CLI:

```bash
# Set individual variables
vercel env add GCP_SERVICE_ACCOUNT_CREDENTIALS production
# Paste the JSON when prompted

# Or use a file
vercel env pull .env.vercel.local
# Edit the file and then:
vercel env push .env.vercel.local production
```

## Important Notes

### ✅ Do's:

- **Use `GCP_SERVICE_ACCOUNT_CREDENTIALS`** for Vercel (not the keyfile path)
- **Keep the JSON on a single line** with proper escaping of `\n` in the private key
- **Enable for all environments** (Production, Preview, Development) if you want consistent behavior
- **Store credentials as Vercel Environment Variables** (never commit to git)
- **Use a dedicated service account** with minimal required permissions (`roles/retail.admin`)

### ❌ Don'ts:

- **Don't use `GOOGLE_APPLICATION_CREDENTIALS`** on Vercel (file paths don't work in serverless)
- **Don't commit the keyfile** to your repository
- **Don't add extra quotes** around the JSON value in Vercel
- **Don't try to upload the keyfile** to Vercel's filesystem (it's ephemeral)
- **Don't use your personal GCP account credentials** - always use a service account

## Verification

After deployment, check your Vercel function logs for:

```
[Vertex Client] Using credentials from GCP_SERVICE_ACCOUNT_CREDENTIALS
```

If you see this instead, something is wrong:

```
[Vertex Client] Using Application Default Credentials (ADC)
```

## Testing on Vercel

1. **Deploy to Preview**: Push a branch and Vercel will create a preview deployment
2. **Check logs**: Go to your deployment → **Functions** → Click on a function → **Logs**
3. **Test search**: Use the search in the header and watch the logs for `[Vertex Search]` entries
4. **Verify performance**: Check the timing logs for API latency

## Common Issues

### "GOOGLE_APPLICATION_CREDENTIALS not found"
- This is normal on Vercel - the keyfile path approach doesn't work in serverless
- Make sure `GCP_SERVICE_ACCOUNT_CREDENTIALS` is set instead

### "Failed to parse GCP_SERVICE_ACCOUNT_CREDENTIALS"
- Check that the JSON is valid
- Ensure `\n` characters in the private key are properly escaped (as literal `\n`, not actual newlines)
- Don't wrap the entire value in extra quotes

### "Getting metadata from plugin failed"
- The private key format is incorrect
- Regenerate the service account key and paste the fresh JSON

### Still using ADC (Application Default Credentials)
- The `GCP_SERVICE_ACCOUNT_CREDENTIALS` variable is not set
- The JSON is malformed and failed to parse
- Check function logs for error messages

## Local Development vs Vercel

| Environment | Method | Variable |
|------------|--------|----------|
| **Local Development** | Keyfile path | `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json` |
| **Vercel/Production** | JSON credentials | `GCP_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account",...}` |

The code automatically detects which method to use based on what's available!

## Security Best Practices

1. **Rotate credentials regularly** - Generate new service account keys periodically
2. **Use least-privilege access** - Only grant `roles/retail.admin` or required permissions
3. **Monitor usage** - Check Google Cloud Console for API usage and potential abuse
4. **Enable audit logging** - Track who's using the credentials in GCP
5. **Don't share keys** - Each environment should have its own service account if possible

## Next Steps

After deploying:

1. **Import your product catalog** to Vertex Retail
2. **Test search functionality** in production
3. **Monitor performance** using the built-in timing logs
4. **Set up alerts** in Google Cloud for API quota/errors
5. **Track costs** in Google Cloud Console billing

## Support

If you encounter issues:

- Check Vercel function logs for detailed error messages
- Look for `[Vertex Client]` and `[Vertex Search]` log entries
- Verify environment variables are set correctly in Vercel dashboard
- Test the same credentials locally first to isolate Vercel-specific issues
