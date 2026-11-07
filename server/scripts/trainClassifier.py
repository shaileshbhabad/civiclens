"""
CivicLens Municipal AI Vision Classifier - Fast PyTorch Training Pipeline
Trains a convolutional neural network (CivicLensVisionNet) on the PCMC dataset.

Usage:
    python server/scripts/trainClassifier.py --epochs 3 --max_per_class 150
"""

import os
import sys
import time
import json
import random
import argparse
from pathlib import Path
from PIL import Image
import numpy as np

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

random.seed(42)
torch.manual_seed(42)

CLASSES = ['pothole', 'non_pothole', 'garbage', 'non_garbage']
CLASS_TO_IDX = {cls_name: i for i, cls_name in enumerate(CLASSES)}
IDX_TO_CLASS = {i: cls_name for i, cls_name in enumerate(CLASSES)}

class CivicDataset(Dataset):
    def __init__(self, samples, img_size=128):
        self.samples = samples
        self.img_size = img_size

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        file_path, class_idx = self.samples[idx]
        try:
            with Image.open(file_path) as img:
                img = img.convert('RGB')
                img = img.resize((self.img_size, self.img_size), Image.Resampling.BILINEAR)
                arr = np.asarray(img, dtype=np.float32) / 255.0  # [H, W, C]
                tensor = torch.from_numpy(arr).permute(2, 0, 1)  # [C, H, W]
                # Normalize with ImageNet mean & std
                mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
                std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
                tensor = (tensor - mean) / std
                return tensor, class_idx
        except Exception:
            return torch.zeros(3, self.img_size, self.img_size), class_idx


class CivicLensVisionNet(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), # 64x64

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), # 32x32

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), # 16x16

            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        self.classifier = nn.Sequential(
            nn.Linear(128 * 4 * 4, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        feat = self.features(x)
        feat = torch.flatten(feat, 1)
        return self.classifier(feat)


def collect_dataset(dataset_dir, max_per_class=None):
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    samples = []
    stats = {}

    for cls_name in CLASSES:
        folder = Path(dataset_dir) / cls_name
        if not folder.exists():
            continue
        files = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in valid_extensions]
        random.shuffle(files)
        if max_per_class and len(files) > max_per_class:
            files = files[:max_per_class]

        stats[cls_name] = len(files)
        cls_idx = CLASS_TO_IDX[cls_name]
        for f in files:
            samples.append((str(f), cls_idx))

    random.shuffle(samples)
    return samples, stats


def main():
    parser = argparse.ArgumentParser(description="Train CivicLens CNN Vision Model")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--max_per_class", type=int, default=150, help="Max images per class")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    dataset_dir = script_dir.parent / "dataset"
    models_dir = script_dir.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    model_save_path = models_dir / "civiclens_model.pt"

    print("==================================================================", flush=True)
    print("   CivicLens Municipal Vision AI - Local PyTorch Model Training   ", flush=True)
    print("==================================================================", flush=True)
    print(f"Dataset base: {dataset_dir}", flush=True)
    print(f"Max samples per class: {args.max_per_class}", flush=True)
    print(f"Epochs: {args.epochs} | Batch size: {args.batch_size} | LR: {args.lr}\n", flush=True)

    samples, stats = collect_dataset(dataset_dir, max_per_class=args.max_per_class)
    for cls_name, count in stats.items():
        print(f"  • {cls_name:12}: {count} images loaded", flush=True)
    print(f"\nTotal training/validation pool: {len(samples)} images", flush=True)

    if len(samples) < 10:
        print("❌ Error: Not enough images found to train model.", flush=True)
        sys.exit(1)

    split_idx = int(0.8 * len(samples))
    train_samples = samples[:split_idx]
    val_samples = samples[split_idx:]

    train_loader = DataLoader(CivicDataset(train_samples, img_size=128), batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(CivicDataset(val_samples, img_size=128), batch_size=args.batch_size, shuffle=False)

    device = torch.device("cpu")
    print(f"Using compute device: {device}\n", flush=True)

    model = CivicLensVisionNet(num_classes=len(CLASSES)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-4)

    best_val_acc = 0.0
    history = []
    start_time = time.time()

    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            total_train += labels.size(0)
            correct_train += (predicted == labels).sum().item()

        train_loss = running_loss / total_train
        train_acc = (correct_train / total_train) * 100

        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0
        defect_correct = 0

        with torch.no_grad():
            for images, labels in val_loader:
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)

                _, predicted = torch.max(outputs, 1)
                total_val += labels.size(0)
                correct_val += (predicted == labels).sum().item()

                pred_is_defect = (predicted == CLASS_TO_IDX['pothole']) | (predicted == CLASS_TO_IDX['garbage'])
                label_is_defect = (labels == CLASS_TO_IDX['pothole']) | (labels == CLASS_TO_IDX['garbage'])
                defect_correct += (pred_is_defect == label_is_defect).sum().item()

        val_loss = val_loss / total_val
        val_acc = (correct_val / total_val) * 100
        val_defect_acc = (defect_correct / total_val) * 100

        print(f"Epoch [{epoch}/{args.epochs}] -> Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}% | Defect Detection: {val_defect_acc:.1f}%", flush=True)

        history.append({
            "epoch": epoch,
            "train_loss": train_loss,
            "train_acc": train_acc,
            "val_loss": val_loss,
            "val_acc": val_acc,
            "val_defect_acc": val_defect_acc
        })

        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "classes": CLASSES,
                "class_to_idx": CLASS_TO_IDX,
                "img_size": 128,
                "best_val_acc": best_val_acc
            }, model_save_path)

    elapsed = time.time() - start_time
    print(f"\nTraining completed in {elapsed:.1f}s. Best Validation Accuracy: {best_val_acc:.1f}%", flush=True)
    print(f"Saved weights to: {model_save_path}", flush=True)

    metrics_path = dataset_dir / "local_model_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "model_architecture": "CivicLensVisionNet",
            "classes": CLASSES,
            "total_samples": len(samples),
            "class_distribution": stats,
            "epochs": args.epochs,
            "best_val_accuracy_percent": round(best_val_acc, 2),
            "training_history": history
        }, f, indent=2)
    print(f"Metrics report written to: {metrics_path}\n", flush=True)

if __name__ == "__main__":
    main()
