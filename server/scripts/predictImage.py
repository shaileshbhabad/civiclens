"""
CivicLens Municipal AI Vision Local Inference Script
Runs ultra-fast local defect inference using your trained PyTorch weights.

Supports:
- MobileNetV3 (Colab Transfer Learning model)
- CivicLensVisionNet (Local CNN model)

Usage:
    python server/scripts/predictImage.py --image "server/dataset/pothole/Img (10).jpg"
"""

import sys
import json
import argparse
from pathlib import Path
from PIL import Image
import numpy as np

import torch
import torch.nn as nn
import torchvision.models as models

CLASSES = ['garbage', 'non_garbage', 'non_pothole', 'pothole']

def load_trained_model(model_path):
    checkpoint = torch.load(str(model_path), map_location=torch.device('cpu'))
    classes = checkpoint.get("classes", CLASSES)
    arch = checkpoint.get("architecture", "mobilenet_v3_small")
    img_size = checkpoint.get("img_size", 224)

    if arch == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=None)
        num_features = model.classifier[3].in_features
        model.classifier[3] = nn.Sequential(
            nn.Linear(num_features, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, len(classes))
        )
    else:
        # Fallback to custom CNN
        class CivicLensVisionNet(nn.Module):
            def __init__(self, num_classes=4):
                super().__init__()
                self.features = nn.Sequential(
                    nn.Conv2d(3, 32, kernel_size=3, padding=1),
                    nn.BatchNorm2d(32),
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(2, 2),
                    nn.Conv2d(32, 64, kernel_size=3, padding=1),
                    nn.BatchNorm2d(64),
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(2, 2),
                    nn.Conv2d(64, 128, kernel_size=3, padding=1),
                    nn.BatchNorm2d(128),
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(2, 2),
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

        model = CivicLensVisionNet(num_classes=len(classes))

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    return model, classes, img_size, arch, checkpoint.get("best_val_acc")


def predict(image_path, model_path=None):
    script_dir = Path(__file__).resolve().parent
    if model_path is None:
        model_path = script_dir.parent / "models" / "civiclens_model.pt"

    if not Path(model_path).exists():
        return {
            "error": f"Model weights not found at {model_path}."
        }

    model, classes, img_size, arch, val_acc = load_trained_model(model_path)

    with Image.open(image_path) as img:
        img = img.convert('RGB')
        img = img.resize((img_size, img_size), Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float32) / 255.0
        tensor = torch.from_numpy(arr).permute(2, 0, 1)
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        tensor = (tensor - mean) / std
        tensor = tensor.unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.softmax(outputs, dim=1)[0].tolist()

    class_probs = {classes[i]: round(probabilities[i], 4) for i in range(len(classes))}
    predicted_idx = int(torch.argmax(outputs, dim=1)[0].item())
    predicted_class = classes[predicted_idx]
    confidence = class_probs[predicted_class]

    is_defect = predicted_class in ['pothole', 'garbage']
    category = predicted_class if is_defect else "none"

    return {
        "image": str(image_path),
        "architecture": arch,
        "modelValidationAccuracy": f"{round(val_acc, 2)}%" if val_acc else "N/A",
        "predictedClass": predicted_class,
        "defectDetected": is_defect,
        "category": category,
        "confidence": confidence,
        "probabilities": class_probs,
        "engine": f"PyTorch {arch} (CivicLens Local Model)"
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True, help="Path to test image")
    parser.add_argument("--model", type=str, default=None, help="Path to model weights")
    args = parser.parse_args()

    result = predict(args.image, args.model)
    print(json.dumps(result, indent=2))
