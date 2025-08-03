# Procedure for Adding a New AI Model to Orb Game

Below is a comprehensive, step-by-step procedure for adding a new AI model to the Orb Game. This procedure assumes you have a basic understanding of the project's structure (React frontend, Node.js backend, Azure deployment). It covers everything from storing the API key in Azure Key Vault to updating the frontend selection list, prepopulating stories, testing, and deployment. I've also included a specific section at the end for moving the Grok key to Key Vault, as requested.

The procedure is designed to be modular and safe, minimizing downtime. If you encounter issues, I can help troubleshoot or execute specific steps.

### Prerequisites
- Access to Azure Portal (for Key Vault and Container Apps).
- The project's code cloned locally.
- Azure CLI installed and logged in (`az login`).
- GitHub CLI installed and logged in (`gh auth login`) if using GitHub Actions.
- A new AI model provider with an API key (e.g., Anthropic Claude, OpenAI GPT-4, etc.).
- Basic knowledge of JavaScript/Node.js for code edits.

### Procedure for Adding a New AI Model

#### 1. **Prepare the New Model Details**
   - Decide on a unique name for the model (e.g., "claude-3" for Anthropic Claude).
   - Note the model's API endpoint, required parameters (e.g., model name, max tokens), and authentication method (usually an API key).
   - Test the model manually using `curl` or Postman to ensure your API key works (e.g., make a sample API call to generate a story).

#### 2. **Store the API Key in Azure Key Vault**
   - Use the existing Key Vault (`orb-game-kv-eastus2`).
   - Run the following command in your terminal to add the new key (replace placeholders):
     ```
     az keyvault secret set --vault-name orb-game-kv-eastus2 --name "NEW-MODEL-API-KEY" --value "your-new-api-key"
     ```
   - Replace "NEW-MODEL-API-KEY" with a unique name (e.g., "ANTHROPIC-API-KEY" for Claude).
   - Verify the secret was added:
     ```
     az keyvault secret show --vault-name orb-game-kv-eastus2 --name "NEW-MODEL-API-KEY" --query value -o tsv
     ```

#### 3. **Update the Backend to Fetch and Use the New Key from Key Vault**
   - Open `backend/backend-server.js`.
   - In the `initializeSecrets` function, add a line to fetch the new key:
     ```javascript
     process.env.NEW_MODEL_API_KEY = (await client.getSecret("NEW-MODEL-API-KEY")).value;
     ```
     - Place this inside the `Promise.all` array, similar to the existing keys (e.g., add `client.getSecret("NEW-MODEL-API-KEY")` to the array, and destructure it in the assignment).
   - Add a new function for the model's API call (e.g., `generateStoriesWithNewModel`).
     - Copy the structure from an existing model function (e.g., `generateStoriesWithAzureOpenAI`).
     - Update the API endpoint, headers, and body to match the new model's API.
     - Example for a hypothetical Claude model:
       ```javascript
       async function generateStoriesWithClaude(category, epoch, count, customPrompt) {
         try {
           const prompt = customPrompt || `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Claude" }]`;
           
           const response = await fetch('https://api.anthropic.com/v1/completions', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${process.env.NEW_MODEL_API_KEY}`
             },
             body: JSON.stringify({
               model: 'claude-3-sonnet-20240229',
               prompt: prompt,
               max_tokens: 1500
             })
           });

           if (!response.ok) {
             throw new Error(`Claude API error: ${response.status}`);
           }

           const data = await response.json();
           const content = data.completion;
           
           let stories = JSON.parse(content);
           // Generate TTS for each story (use existing logic)
           const storiesWithTTS = await Promise.all(stories.map(async (story) => {
             // TTS logic here (copy from existing function)
             return story;
           }));

           return storiesWithTTS;
         } catch (error) {
           console.error(`Claude story generation failed for ${category}:`, error.message);
           return [];
         }
       }
       ```
   - Update the main story generation logic (in `generateStories` or similar) to include the new model as an option (e.g., if (model === 'claude') call the new function).
   - Save and commit the changes:
     ```
     git add backend/backend-server.js
     git commit -m "Add support for new AI model [MODEL-NAME]"
     ```

#### 4. **Update Prepopulation Logic for the New Model**
   - Open `scripts/backfill-topics.js` (or similar prepopulation script).
   - Add the new model to the prepopulation loop (e.g., call `generateStoriesWithNewModel` for each category).
   - Run the script locally to prepopulate stories:
     ```
     node scripts/backfill-topics.js
     ```
   - This will generate and store stories in Cosmos DB for the new model.

#### 5. **Update Frontend Model Selection List**
   - Open `components/OrbGame.jsx` (or the file with the model selector).
   - Add the new model to the selection list (e.g., dropdown or buttons):
     ```javascript
     const models = [
       { value: 'grok-4', label: 'Grok 4' },
       { value: 'perplexity-sonar', label: 'Perplexity Sonar' },
       { value: 'o4-mini', label: 'O4-Mini' },
       { value: 'new-model', label: 'New Model' } // Add this line
     ];
     ```
   - Ensure the selected model is passed to the backend in the API call (e.g., in the POST body to `/api/orb/generate-news/:category`).
   - Save and commit the changes:
     ```
     git add components/OrbGame.jsx
     git commit -m "Add new AI model to frontend selection list"
     ```

#### 6. **Update Deployment and CI/CD**
   - If the new model requires new environment variables (e.g., a new API key), add them to GitHub Secrets and Azure Container App (use `scripts/set-azure-build-env.sh`).
   - Push changes to GitHub to trigger CI/CD deployment:
     ```
     git push
     ```
   - Manually deploy if needed:
     ```
     ./scripts/deploy-full.sh
     ```

#### 7. **Test the New Model**
   - Local Test:
     - Run the backend locally.
     - Use Postman or curl to test the API with the new model (e.g., set "model": "new-model" in the POST body).
   - Production Test:
     - After deployment, select the new model in the frontend and generate stories.
     - Check logs for success (e.g., `az containerapp logs show --name orb-game-backend-eastus2 --resource-group orb-game-rg-eastus2 --follow false | tail -20`).
   - Verify stories are prepopulated in Cosmos DB (use Azure Portal or a tool like Azure Data Studio).

#### 8. **Update Documentation**
   - Update `README.md` with the new model in the features list and required environment variables.
   - Add any new testing commands to the "Testing" section.

#### 9. **Potential Missed Items**
   - **Rate Limits & Costs**: Monitor the new model's rate limits and costs in Azure Monitor.
   - **Error Handling**: Add specific error handling for the new model's API (e.g., for 429 rate limit errors).
   - **Frontend Validation**: Add validation in the UI to ensure the new model is available (e.g., disable if not configured).
   - **Prepopulation Cron**: If you have a cron job for prepopulation, update it to include the new model.
   - **Security**: Ensure the new key has the least privilege (e.g., read-only if possible).
   - **Rollback**: Have a rollback plan if the new model causes issues (e.g., revert code and redeploy).

### Moving the Grok Key to Key Vault
The Grok key is not currently in Key Vault, so let's move it now as part of this procedure.

1. **Add Grok Key to Key Vault**:
   - Run:
     ```
     az keyvault secret set --vault-name orb-game-kv-eastus2 --name "GROK-API-KEY" --value "your-grok-api-key"
     ```
   - Replace "your-grok-api-key" with the actual key.

2. **Update Backend to Fetch Grok Key from Key Vault**:
   - Open `backend/backend-server.js`.
   - In the `initializeSecrets` function, add:
     ```javascript
     process.env.GROK_API_KEY = (await client.getSecret("GROK-API-KEY")).value;
     ```
     - Add it to the `Promise.all` array, similar to the other keys.

3. **Remove Old Grok Key from Environment Variables**:
   - Run:
     ```
     az containerapp update --name orb-game-backend-eastus2 --resource-group orb-game-rg-eastus2 --remove-env-vars GROK_API_KEY
     ```

4. **Test and Deploy**:
   - Follow steps 7-9 above to test and deploy the updated backend.

This procedure should cover everything you need to add a new AI model. If you have a specific model in mind (e.g., Claude), I can help execute this step by step or edit specific files. Let me know how you'd like to proceed!