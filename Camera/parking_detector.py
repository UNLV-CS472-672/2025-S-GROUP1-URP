import cv2
import numpy as np
import json

# === Load class names ===
with open("Camera/coco.names.txt", "rt") as f:
    classNames = f.read().rstrip("\n").split("\n")

# === Load model ===
configPath = "Camera/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"
weightsPath = "Camera/frozen_inference_graph.pb"

net = cv2.dnn_DetectionModel(weightsPath, configPath)
net.setInputSize(320, 320)
net.setInputScale(1.0 / 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)

# === Load Parking Spots from external JSON ===
with open("Camera/parking_spots.json", "r") as f:
    parking_spots = json.load(f)

# === Spot status history for smoothing ===
HISTORY_LENGTH = 10
spot_history = {
    spot["id"]: {
        "history": [],
        "status": "FREE"
    } for spot in parking_spots
}

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    classIds, confs, boxes = net.detect(frame, confThreshold=0.45)
    detected_centers = []

    if len(classIds) > 0:
        for classId, confidence, box in zip(classIds.flatten(), confs.flatten(), boxes):
            if 0 < classId <= len(classNames):
                className = classNames[classId - 1]
            else:
                continue

            if className in ["car", "truck"]:
                x, y, w, h = box
                cx, cy = x + w // 2, y + h // 2
                detected_centers.append((cx, cy))

                cv2.rectangle(frame, box, (255, 255, 0), 2)
                cv2.circle(frame, (cx, cy), 12, (0, 0, 255), -1)
                cv2.putText(frame, f"{className} {confidence:.2f}", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)

    for spot in parking_spots:
        spot_id = spot["id"]
        polygon = np.array(spot["points"], dtype=np.int32)
        polygon = cv2.convexHull(polygon)
        is_occupied = False

        for (cx, cy) in detected_centers:
            if cv2.pointPolygonTest(polygon, (int(cx), int(cy)), False) >= 0:
                is_occupied = True
                break

        history = spot_history[spot_id]["history"]
        history.append("OCCUPIED" if is_occupied else "FREE")
        if len(history) > HISTORY_LENGTH:
            history.pop(0)

        status = "OCCUPIED" if history.count("OCCUPIED") > history.count("FREE") else "FREE"
        spot_history[spot_id]["status"] = status

    for spot in parking_spots:
        pts = spot["points"]
        status = spot_history[spot["id"]]["status"]
        color = (0, 255, 0) if status == "FREE" else (0, 0, 255)

        overlay = frame.copy()
        cv2.fillPoly(overlay, [np.array(pts, np.int32)], color)
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)

        cv2.polylines(frame, [np.array(pts, np.int32)], True, color, 2)
        cv2.putText(frame, f"Spot {spot['id']}: {status}",
                    (pts[0][0], pts[0][1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    cv2.imshow("Smart Parking Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()