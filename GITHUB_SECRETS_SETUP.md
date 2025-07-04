# GitHub Secrets Setup for AIMCS Deployment

This guide explains how to set up GitHub secrets for secure deployment of the AIMCS backend with web search functionality.

## 🔐 Required Secrets

The following secrets need to be configured in your GitHub repository:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `AZURE_CREDENTIALS` | Azure service principal credentials (JSON) | ✅ |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL | ✅ |
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | ✅ |
| `AZURE_OPENAI_DEPLOYMENT` | Your Azure OpenAI deployment name | ✅ |
| `AZURE_OPENAI_TTS_DEPLOYMENT` | Your Azure OpenAI TTS deployment name | ✅ |
| `PERPLEXITY_API_KEY` | Your Perplexity API key for web search | ✅ |

## 🚀 Quick Setup

### Option 1: Automated Setup Script

1. **Install GitHub CLI** (if not already installed):
   ```bash
   brew install gh  # macOS
   # or visit: https://cli.github.com/
   ```

2. **Run the setup script**:
   ```bash
   ./scripts/setup-github-secrets.sh
   ```

3. **Follow the prompts** to enter your API keys and credentials.

### Option 2: Manual Setup

1. **Go to your GitHub repository settings**:
   ```
   https://github.com/zimaxnet/aimcs-deploy/settings/secrets/actions
   ```

2. **Add each secret** by clicking "New repository secret"

## 🔑 Getting Your API Keys

### Azure OpenAI
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. Go to "Keys and Endpoint" section
4. Copy the endpoint URL and key

### Perplexity API
1. Go to [Perplexity AI](https://www.perplexity.ai/)
2. Sign up or log in
3. Go to API section
4. Generate a new API key

### Azure Service Principal
Run this command to create a service principal:
```bash
az ad sp create-for-rbac --name aimcs-deploy --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID --sdk-auth
```

## 🔄 Updating Secrets

### Option 1: GitHub Actions Workflow
1. Go to your repository on GitHub
2. Navigate to "Actions" tab
3. Select "Update Backend Secrets" workflow
4. Click "Run workflow"
5. The workflow will update the container app with new environment variables

### Option 2: Manual Update
```bash
az containerapp update \
  --name aimcs-backend-eastus2 \
  --resource-group aimcs-rg-eastus2 \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="your-endpoint" \
    AZURE_OPENAI_API_KEY="your-key" \
    PERPLEXITY_API_KEY="your-perplexity-key"
```

## 🧪 Testing Web Search

After setting up the secrets, test the web search functionality:

```bash
# Test web search endpoint
curl -X POST https://api.aimcs.net/api/web-search \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI news today"}'

# Test chat with web search
curl -X POST https://api.aimcs.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the latest news about AI today?"}'
```

## 🔒 Security Notes

- **Never commit API keys** to your repository
- **Use GitHub secrets** for all sensitive data
- **Rotate API keys** regularly
- **Monitor usage** of your API keys
- **Use least privilege** for Azure service principals

## 🆘 Troubleshooting

### Common Issues

1. **"Web search failed" error**:
   - Check if `PERPLEXITY_API_KEY` is set correctly
   - Verify the API key is valid and has credits

2. **"AI not configured" error**:
   - Check if Azure OpenAI secrets are set correctly
   - Verify the endpoint URL format

3. **Deployment fails**:
   - Check if `AZURE_CREDENTIALS` is valid JSON
   - Verify the service principal has proper permissions

### Getting Help

- Check the GitHub Actions logs for detailed error messages
- Verify all secrets are set in the repository settings
- Test individual API endpoints separately 