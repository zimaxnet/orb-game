# 🔧 Fix GitHub Pages Permissions Issue

## Problem
The GitHub Actions workflow is failing because the `github-actions[bot]` doesn't have permission to push to the `gh-pages` branch.

## Solution Steps

### 1. **Configure Repository Settings**

Go to your repository settings:
- Navigate to: `https://github.com/zimaxnet/orb-game/settings`
- Click on **"Actions"** in the left sidebar
- Click on **"General"** under Actions

### 2. **Set Workflow Permissions**

Under **"Workflow permissions"**:
- ✅ **Check**: "Read and write permissions"
- ✅ **Check**: "Allow GitHub Actions to create and approve pull requests"
- ✅ **Check**: "Allow GitHub Actions to create and approve pull requests"

### 3. **Configure GitHub Pages**

Go to **"Pages"** in the left sidebar:
- **Source**: Select "Deploy from a branch"
- **Branch**: Select `gh-pages`
- **Folder**: Select `/ (root)`
- ✅ **Check**: "Enforce HTTPS"

### 4. **Verify Branch Protection (if needed)**

If you have branch protection rules:
- Go to **"Branches"** in settings
- Check if `gh-pages` branch has protection rules
- If yes, ensure GitHub Actions can bypass branch protection

### 5. **Alternative: Use Personal Access Token**

If the above doesn't work, create a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Add it as a repository secret named `GH_PAT`
4. Update the workflow to use `${{ secrets.GH_PAT }}` instead of `${{ secrets.GITHUB_TOKEN }}`

## Changes Made to Workflow

The `deploy-wiki.yml` workflow has been updated with:

```yaml
# Add permissions for the workflow
permissions:
  contents: write
  pages: write
  id-token: write
```

And the checkout step now explicitly uses the token:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    token: ${{ secrets.GITHUB_TOKEN }}
```

## Test the Fix

1. Make a small change to any file in the `docs/` folder
2. Commit and push to trigger the workflow
3. Check the Actions tab to see if the deployment succeeds

## Expected Result

After applying these changes, the workflow should:
- ✅ Successfully build the documentation
- ✅ Push to the `gh-pages` branch
- ✅ Deploy to https://wiki.orbgame.us

## Troubleshooting

If the issue persists:

1. **Check the gh-pages branch exists**:
   ```bash
   git ls-remote origin gh-pages
   ```

2. **Manually create the gh-pages branch**:
   ```bash
   git checkout --orphan gh-pages
   git commit --allow-empty -m "Initial gh-pages branch"
   git push origin gh-pages
   ```

3. **Verify repository secrets**:
   - Go to Settings → Secrets and variables → Actions
   - Ensure `GITHUB_TOKEN` is available (it's automatic)

4. **Check workflow logs**:
   - Go to Actions tab
   - Click on the failed workflow
   - Look for specific error messages

## Success Indicators

When the fix works, you should see:
- ✅ Green checkmark in Actions tab
- ✅ New commits on the `gh-pages` branch
- ✅ Live website at https://wiki.orbgame.us 