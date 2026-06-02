# Project Spec: E51 Photo Upload Compression & Resilience

## Overview
The mobile intake flow is currently hanging during photo uploads because large smartphone images (up to 20MB) are being uploaded raw over mobile networks, and the processing Cloud Function is silently crashing (OOM) due to insufficient memory limits. This project implements client-side compression to eliminate the network bottleneck and increases the Cloud Function memory allocation to ensure processing resilience.

## Goals
1. Implement `browser-image-compression` in `MobileIntakePage.tsx` to reduce photo payloads before they hit Firebase Storage.
2. Update the `processUploadedImage` Cloud Function to use a `1GiB` memory limit and `120s` timeout.

## Persona Impact
- **Staff (Marie / Kevin):** Regains the ability to reliably capture and upload photos during inventory intake using mobile devices, without experiencing silent UI hangs or failed uploads.

## Compliance & Governance
- No schema changes are required.
- No new tracking or logging requirements.
- Existing Staff auth gates on the Callable remain untouched.
