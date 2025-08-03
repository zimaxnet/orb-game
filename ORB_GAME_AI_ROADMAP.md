# Orb Game – AI Integration Roadmap

This document outlines a phased strategy for incorporating Azure AI services into the Orb Game.  Each phase is incremental—providing immediate value while laying the groundwork for the next—and can be delivered independently.

---

## Phase 1 – Foundation: Identity & Secrets

**Goal:** Remove static secrets from source and enable secure, role-based access to all Azure services.

1. Provision a **System-Assigned Managed Identity** for the backend container / App Service.
2. Migrate secrets (OpenAI keys, Speech, Perplexity, Mongo URI) into **Azure Key Vault**.
3. Grant the identity `Key Vault Secrets User`, `Cognitive Services User`, and `Azure OpenAI Contributor` roles.
4. Update `backend/backend-server.js` and shell scripts to fetch secrets at runtime.
5. Modify CI/CD pipeline (GitHub Actions) to deploy with the managed identity.

---

## Phase 2 – Retrieval-Augmented Generation (RAG)

**Goal:** Serve grounded, citation-rich answers using game documentation.

1. Create **Azure Blob Storage** + **Cognitive Search** service.
2. Build an ingestion script that uploads these sources:
   - `docs/`, `orb_game.md`, patch notes, FAQs.
3. Index with semantic ranking enabled.
4. Add `/api/rag-chat` endpoint in `backend-server.js`:
   1. Query Cognitive Search for top N docs.
   2. Pass docs + user prompt to GPT-4o (OpenAI API) via RAG pattern.
   3. Return the answer along with source citations.
5. Update `components/ChatInterface.jsx` to call the new endpoint and show citations in the UI.

---

## Phase 3 – Speech (STT & TTS)

**Goal:** Enable voice input/output for hands-free play and accessibility.

1. Generalise existing TTS logic into `/api/voice/tts` for arbitrary text.
2. Add streaming Speech-to-Text endpoint `/api/voice/stt` using Azure **Speech SDK** WebSockets.
3. Front-end additions:
   - Microphone button in `ChatInterface.jsx`.
   - Stream audio, display interim text, push final transcript into chat flow.

---

## Phase 4 – Toxicity & Moderation (Azure ML)

**Goal:** Keep chat safe and welcoming.

1. Spin up an **Azure ML** workspace; fine-tune a RoBERTa (or similar) classifier on moderated chat logs.
2. Deploy as Managed Online Endpoint.
3. Insert middleware in `backend-server.js` that calls the endpoint before each OpenAI request; block or flag toxic messages over threshold.

---

## Phase 5 – Structured Bot Skills (Azure Bot Service)

**Goal:** Provide guided tutorials, onboarding, and FAQs alongside free-form chat.

1. Design dialog flows in **Bot Framework Composer**.
2. Host bot in **Azure Bot Service**; configure OpenAI as fallback intent.
3. Integrate Direct Line WebSocket client in React; allow seamless hand-off between RAG chat and structured bot.

---

## Phase 6 – Vision-Driven Features (Optional)

**Goal:** Add AR/vision capabilities where gameplay benefits.

1. If the game captures screenshots, call **Computer Vision** / **Custom Vision** to detect objects, hazards, or achievements.
2. Feed results into gameplay events or overlay UI elements.

---

## Phase 7 – Monitoring & Cost Control

**Goal:** Observe performance and optimise spend across AI services.

1. Wrap every outbound Azure call with **Application Insights** telemetry and correlation IDs.
2. Build a weekly cost dashboard using **Azure Consumption API**.
3. Introduce **Azure Cache for Redis** to store embeddings and generated TTS audio, reducing duplicate calls.

---

## Phase 8 – Deployment Hardening & Infrastructure-as-Code

**Goal:** Achieve repeatable, zero-downtime releases.

1. Refactor `backend-Dockerfile` to multi-stage build (smaller image).
2. Author **Bicep / Terraform** scripts describing all Azure resources (Key Vault, Search, ML, Bot, Cognitive Services, Redis, Container Apps).
3. Adopt **Blue-Green** deployment strategy on Azure Container Apps or AKS.

---

## Suggested Timeline

| Month | Deliverable |
|-------|-------------|
| 1     | Phase 1 complete, CI/CD fetching secrets via Managed Identity |
| 2     | Phase 2 (RAG) live in production |
| 3     | Phase 3 (Speech) rolled out to beta testers |
| 4     | Phase 4 (Moderation) & Phase 5 (Bot Skills) |
| 5–6   | Optional Phase 6, full Monitoring (Phase 7) |
| 6     | IaC & Blue-Green deployment (Phase 8) |

> **Note:** Phases can overlap—e.g. monitoring can start as soon as Phase 2 lands.

---

### Dependencies & Risk Mitigation

* **Managed Identity** must exist before any other service calls are refactored.
* Speech features require HTTPS and correct CORS/WebSocket config—plan staging tests early.
* Toxicity model depends on availability of labelled chat data—begin data collection in Phase 1.
* Aim for small, end-to-end vertical slices in each sprint to surface integration issues quickly.

---

### Contact & Ownership

| Area | Tech Lead | Backup |
|------|-----------|--------|
| Backend & OpenAI | _tbd_ | _tbd_ |
| Front-end React  | _tbd_ | _tbd_ |
| Azure ML / Moderation | _tbd_ | _tbd_ |
| DevOps / IaC | _tbd_ | _tbd_ |

_This roadmap is a living document—update milestones, owners, and timeline as the project evolves._ 