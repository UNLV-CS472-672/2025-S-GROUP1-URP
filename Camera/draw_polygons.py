import cv2
import numpy as np

spots = []
current_polygon = []
spot_id = 1

def mouse_callback(event, x, y, flags, param):
    global current_polygon, spot_id

    if event == cv2.EVENT_LBUTTONDOWN:
        current_polygon.append((x, y))
        print(f"Point added: ({x}, {y})")

# === Setup ===
cap = cv2.VideoCapture(0)
cv2.namedWindow("Polygon Drawer")
cv2.setMouseCallback("Polygon Drawer", mouse_callback)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Draw current polygon in progress
    for point in current_polygon:
        cv2.circle(frame, point, 5, (255, 0, 255), -1)
    if len(current_polygon) == 4:
        cv2.polylines(frame, [np.array(current_polygon, np.int32)], isClosed=True, color=(255, 0, 255), thickness=2)

    # Draw finalized spots
    for i, spot in enumerate(spots):
        cv2.polylines(frame, [np.array(spot, np.int32)], isClosed=True, color=(0, 255, 0), thickness=2)
        center = tuple(map(int, spot[0]))
        cv2.putText(frame, f"Spot {i+1}", (center[0], center[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

    cv2.imshow("Polygon Drawer", frame)
    key = cv2.waitKey(1)

    # Finalize spot
    if key == 13:  # Enter key
        if len(current_polygon) == 4:
            spots.append(current_polygon.copy())
            print(f"Spot {spot_id} saved: {current_polygon}")
            spot_id += 1
            current_polygon = []
        else:
            print("⚠️ Please click 4 points before pressing Enter.")

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# === Print Final Output ===
print("\nYour Final Spot Coordinates:")
for i, poly in enumerate(spots):
    print(f"Spot {i+1}: {poly}")
