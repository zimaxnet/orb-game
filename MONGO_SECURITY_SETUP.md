# Azure Cosmos DB for MongoDB Security Setup

## 🔐 Securing Azure Cosmos DB Connection String

The Azure Cosmos DB for MongoDB connection string contains sensitive credentials and should **NEVER** be committed to the repository. Instead, it should be stored securely in GitHub Secrets.

## Current Setup

The backend deployment workflow (`.github/workflows/deploy-backend.yml`) is already configured to use the Azure Cosmos DB URI from GitHub Secrets:

```yaml
MONGO_URI="${{ secrets.MONGO_URI }}"
```

## Adding the Azure Cosmos DB URI to GitHub Secrets

### Option 1: Using the provided script (Recommended)

1. Make sure you have GitHub CLI installed:
   ```bash
   # Install GitHub CLI
   # macOS: brew install gh
   # Or download from: https://cli.github.com/
   ```

2. Authenticate with GitHub:
   ```bash
   gh auth login
   ```

3. Run the script:
   ```bash
   ./scripts/add-mongo-secret.sh
   ```

4. Enter your Azure Cosmos DB for MongoDB URI when prompted (it will be hidden)

### Option 2: Manual GitHub CLI

```bash
gh secret set MONGO_URI --body "your-azure-cosmos-db-connection-string-here"
```

### Option 3: GitHub Web Interface

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Name: `MONGO_URI`
6. Value: Your Azure Cosmos DB for MongoDB connection string
7. Click "Add secret"

## Security Best Practices

✅ **DO:**
- Store the Azure Cosmos DB URI in GitHub Secrets
- Use `${{ secrets.MONGO_URI }}` in workflows
- Keep the URI private and secure

❌ **DON'T:**
- Commit the Azure Cosmos DB URI to the repository
- Share the URI in public discussions
- Store it in plain text files
- Include it in environment files that get committed

## Current Azure Cosmos DB URI Format

Your Azure Cosmos DB for MongoDB URI format should look like:
```
mongodb://<account-name>:<primary-key>@<account-name>.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@<account-name>@
```

This contains:
- Account Name: Your Azure Cosmos DB account name
- Primary Key: Your Azure Cosmos DB primary key
- Endpoint: Your Azure Cosmos DB MongoDB endpoint

## Verification

After adding the secret, you can verify it's working by:

1. Triggering a backend deployment
2. Checking the deployment logs
3. Testing the backend endpoints

The backend should successfully connect to MongoDB using the secret.

## Troubleshooting

If the backend fails to connect to Azure Cosmos DB:

1. Verify the secret is set correctly in GitHub
2. Check the deployment logs for connection errors
3. Ensure the Azure Cosmos DB URI format is correct
4. Verify network access from Azure Container Apps to Azure Cosmos DB 