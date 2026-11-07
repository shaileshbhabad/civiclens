# CivicLens Municipal Vision Dataset

This directory holds local datasets for evaluating and training CivicLens Computer Vision models.

## Directory Structure

- `pothole/`: Real road potholes, surface cavities, and asphalt depression photographs.
- `non_pothole/`: Smooth, intact, clean roads without defects.
- `garbage/`: Overflowing bins, street litter, scattered plastic refuse.
- `non_garbage/`: Clean sidewalks, swept public areas without garbage.

## How to Ingest & Benchmark Your Local Images

### Method 1: Drop into Folders
Place your images into the corresponding subfolder above and run:
```bash
cd server
node scripts/ingestDataset.mjs
```

### Method 2: Point Directly to Your Local Folder
If your images are already in a local folder on your computer:
```bash
cd server
node scripts/ingestDataset.mjs --source "C:\path\to\your\folder" --category pothole
```

The script will:
1. Load each image into the `qwen/qwen3.8-27b` Multimodal Vision AI.
2. Verify defect classification, physical feature extraction, and confidence scores.
3. Generate a complete evaluation report saved to `evaluation_report.json`.
