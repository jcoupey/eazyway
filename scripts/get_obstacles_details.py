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
        # TODO check for existing image or audio to avoid fetching all
        # details already processed.

        # Get full details.
        full_obstacle = get_full_obstacle(obstacles_URL, obstacle["properties"]["id"])

        # Handle images.
        if len(full_obstacle["IMAGE1"]) > 0:
            image = Image.open(BytesIO(base64.b64decode(full_obstacle["IMAGE1"])))

            if full_obstacle["ORIENTATION"][0] == "0":
                image = image.rotate(-90)

            image_path = "img/obstacles/" + obstacle["properties"]["id"] + ".jpg"
            print("Writing image " + image_path)
            image.save(image_path)

    with open("data/obstacles.json", "w") as out:
        json.dump(geojson_obstacles, out)
