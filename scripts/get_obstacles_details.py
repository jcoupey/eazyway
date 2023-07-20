import base64, json, requests, sys

from PIL import Image
from io import BytesIO


def get_full_obstacle(obstacles_URL, obstacle_id):
    req = obstacles_URL + "/" + obstacle_id
    obstacle = requests.get(req).json()

    return obstacle


if __name__ == "__main__":
    obstacles_URL = sys.argv[1]
    obstacles_list = sys.argv[2]

    geojson_obstacles = json.load(open(obstacles_list, "r"))

    for obstacle in geojson_obstacles["features"]:
        # Get full details.
        full_obstacle = get_full_obstacle(obstacles_URL, obstacle["properties"]["id"])

        # Handle image.
        if len(full_obstacle["IMAGE1"]) > 0:
            image = Image.open(BytesIO(base64.b64decode(full_obstacle["IMAGE1"])))

            if full_obstacle["ORIENTATION"][0] == "0":
                image = image.rotate(-90)

            image_path = "img/obstacles/" + obstacle["properties"]["id"] + ".jpg"
            print("Writing image " + image_path)
            image.save(image_path)

        # Handle audio.
        audio_files = 0
        if len(full_obstacle["AUDIO1"]) > 0:
            audio_files += 1
            audio1_path = "audio/obstacles/" + obstacle["properties"]["id"] + "_1.wav"
            print("Writing audio " + audio1_path)
            with open(audio1_path, "wb") as wav_file:
                wav_file.write(base64.b64decode(full_obstacle["AUDIO1"]))

        if len(full_obstacle["AUDIO2"]) > 0:
            audio_files += 1
            audio2_path = "audio/obstacles/" + obstacle["properties"]["id"] + "_2.wav"
            print("Writing audio " + audio2_path)
            with open(audio2_path, "wb") as wav_file:
                wav_file.write(base64.b64decode(full_obstacle["AUDIO2"]))

        obstacle["properties"]["audio_files"] = audio_files

    with open("data/obstacles.json", "w") as out:
        json.dump(geojson_obstacles, out)
