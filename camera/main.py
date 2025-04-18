import argparse
import yaml
import logging
from coordinates_generator import CoordinatesGenerator
from motion_detector import MotionDetector
from colors import *
import cv2


def main():
    logging.basicConfig(level=logging.INFO)

    choice = input("Press 'n' to take a new image or 'e' to use an existing image: ").strip().lower()

    if choice == 'n':
        # Capture image from webcam
        cam = cv2.VideoCapture(0)
        if not cam.isOpened():
            logging.error("Unable to access the webcam.")
            return

        ret, frame = cam.read()
        if ret:
            cv2.imwrite("images/parking_lot_1.png", frame)
            logging.info("Image captured and saved as parking_lot_1.png")
        else:
            logging.error("Failed to capture image from webcam.")
        cam.release()
        image_file = "images/parking_lot_1.png"
    elif choice == 'e':
        image_file = "images/parking_lot_1.png"
    else:
        logging.error("Invalid choice. Exiting.")
        return

    data_file = "data/coordinates_1.yml"
    start_frame = 400
    video_file = 0  # Use 0 for the default webcam

    print("Press 'n' to create new coordinates or any other key to use existing coordinates.")
    choice = input("Press n/e: ").strip().lower()

    if choice == 'n':
        if image_file is not None:
            with open(data_file, "w+") as points:
                generator = CoordinatesGenerator(image_file, points, COLOR_RED)
                generator.generate()      
    else:
        pass
    
    with open(data_file, "r") as data:
        points = yaml.full_load(data)
        detector = MotionDetector(video_file, points, int(start_frame))
        detector.detect_motion()


def parse_args():
    parser = argparse.ArgumentParser(description='Generates Coordinates File')

    parser.add_argument("--image",
                        dest="image_file",
                        required=False,
                        help="Image file to generate coordinates on")

    parser.add_argument("--video",
                        dest="video_file",
                        required=False,
                        default=0,  # Default to webcam
                        help="Video file to detect motion on (use 0 for webcam)")

    parser.add_argument("--data",
                        dest="data_file",
                        required=True,
                        help="Data file to be used with OpenCV")

    parser.add_argument("--start-frame",
                        dest="start_frame",
                        required=False,
                        default=1,
                        help="Starting frame on the video (ignored for webcam)")

    return parser.parse_args()


if __name__ == '__main__':
    main()
